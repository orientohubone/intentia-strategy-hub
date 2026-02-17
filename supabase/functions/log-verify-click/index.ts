import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogRequest {
  email: string
  user_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, user_id }: LogRequest = await req.json()
    
    if (!email || !user_id) {
      throw new Error('Email e user_id são obrigatórios')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Atualizar log para "clicked"
    const { error: updateError } = await supabase
      .from('verification_logs')
      .update({ 
        clicked_at: new Date().toISOString(),
        status: 'clicked'
      })
      .eq('user_id', user_id)
      .eq('email', email)
      .eq('status', 'sent')
      .is('clicked_at', null)

    if (updateError) {
      console.error('Log update error:', updateError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Log error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
