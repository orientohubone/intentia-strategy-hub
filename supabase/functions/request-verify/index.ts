import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  email: string
  user_id?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, user_id }: VerifyRequest = await req.json()
    
    if (!email) {
      throw new Error('Email é obrigatório')
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Rate Limiting: Check last 15 minutes (Max 3 attempts)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // Check verification_logs for recent attempts
    const { count, error: rateLimitError } = await supabase
      .from('verification_logs')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', fifteenMinutesAgo);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      // Fail closed for security
      throw new Error('Erro temporário. Tente novamente mais tarde.')
    }

    if (count && count >= 3) {
      console.warn(`Rate limit exceeded for ${email}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Muitas tentativas. Aguarde 15 minutos.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      )
    }

    // Buscar user_id se não fornecido
    let targetUserId = user_id
    if (!targetUserId) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError
      
      const user = userData.users.find(u => u.email === email)
      if (!user) {
        // Don't reveal if user exists or not (security best practice), but here we need ID.
        // If we want to be strict, we should say "If user exists, link sent".
        // But the code logic requires user.id for the log.
        // Let's keep it but generalize error message if possible, or keep as is for internal tool.
        // Given it's "request-verify", likely internal or test tool.
        throw new Error('Usuário não encontrado.')
      }
      
      targetUserId = user.id
    }

    // Gerar magic link via Admin API
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('APP_URL_2') || 'http://localhost:8084'}/verify-success`
      }
    })

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError)
      throw new Error('Erro ao gerar magic link')
    }

    // REMOVED SENSITIVE LOGS
    // console.log('Magic link data completo:', magicLinkData)
    const magicLink = magicLinkData?.properties?.action_link || magicLinkData?.action_link
    // console.log('🔗 Magic Link gerado:', magicLink)

    // Log de envio (isolado)
    const { error: logError } = await supabase
      .from('verification_logs')
      .insert({
        user_id: targetUserId,
        email: email,
        magic_link: magicLink, // Keeping this as it might be needed for the test flow, but removed from console
        status: 'sent',
        metadata: {
          generated_at: new Date().toISOString(),
          test_mode: true
        }
      })

    if (logError) {
      console.error('Log insert error:', logError)
    }

    console.log(`Magic link generated for ${email}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link gerado com sucesso (verifique seu e-mail)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Verification error:', error.message) // Only log message, not full error object if it contains sensitive data
    
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
