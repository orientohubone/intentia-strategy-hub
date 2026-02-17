import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Meta Data Deletion Callback
 * 
 * When a user removes the app from their Meta account settings,
 * Meta sends a signed POST request to this endpoint.
 * 
 * We must:
 * 1. Verify the signed_request from Meta
 * 2. Find the user by their Meta user ID
 * 3. Delete their Meta integration data
 * 4. Return a confirmation URL and confirmation code
 * 
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

function base64UrlDecode(str: string): Uint8Array {
  // Replace URL-safe chars and add padding
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function parseSignedRequest(signedRequest: string, appSecret: string): Promise<any | null> {
  try {
    const [encodedSig, payload] = signedRequest.split(".", 2);
    if (!encodedSig || !payload) return null;

    // Decode the signature
    const sig = base64UrlDecode(encodedSig);

    // Compute expected signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
    );

    // Compare signatures
    if (sig.length !== expectedSig.length) return null;
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (sig[i] !== expectedSig[i]) match = false;
    }
    if (!match) return null;

    // Decode payload
    const decoded = new TextDecoder().decode(base64UrlDecode(payload));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Meta sends POST with form-encoded body
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appSecret = Deno.env.get("META_ADS_CLIENT_SECRET");
    if (!appSecret) {
      console.error("META_ADS_CLIENT_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse form data
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return new Response(JSON.stringify({ error: "Missing signed_request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify and decode the signed request
    const data = await parseSignedRequest(signedRequest, appSecret);
    if (!data) {
      return new Response(JSON.stringify({ error: "Invalid signed_request" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metaUserId = data.user_id;
    if (!metaUserId) {
      return new Response(JSON.stringify({ error: "No user_id in signed_request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique confirmation code
    const confirmationCode = crypto.randomUUID();

    // Find and delete the Meta integration for this user
    // The account_id in ad_integrations stores the Meta user/account ID
    const { data: integrations, error: findError } = await supabase
      .from("ad_integrations")
      .select("id, user_id, account_id, account_name")
      .eq("provider", "meta_ads")
      .or(`account_id.eq.${metaUserId}`);

    if (findError) {
      console.error("Error finding integration:", findError);
    }

    let deletedCount = 0;

    if (integrations && integrations.length > 0) {
      for (const integration of integrations) {
        // Delete sync logs first
        await supabase
          .from("integration_sync_logs")
          .delete()
          .eq("integration_id", integration.id);

        // Delete the integration itself
        const { error: deleteError } = await supabase
          .from("ad_integrations")
          .delete()
          .eq("id", integration.id);

        if (!deleteError) {
          deletedCount++;
          console.log(`Deleted Meta integration for user ${integration.user_id}, account ${integration.account_id}`);
        } else {
          console.error(`Error deleting integration ${integration.id}:`, deleteError);
        }
      }
    }

    console.log(`Data deletion callback processed: Meta user ${metaUserId}, ${deletedCount} integration(s) deleted, code: ${confirmationCode}`);

    // Meta expects a JSON response with:
    // - url: a URL where the user can check the status of their deletion request
    // - confirmation_code: a unique code for this deletion request
    const appUrl = Deno.env.get("APP_URL") || "https://intentia.orientohub.com.br";
    const statusUrl = `${appUrl}/exclusao-de-dados?code=${confirmationCode}`;

    return new Response(
      JSON.stringify({
        url: statusUrl,
        confirmation_code: confirmationCode,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Data deletion callback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
