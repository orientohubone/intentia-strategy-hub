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

interface MagicLinkResponse {
  action_link: string
  email_otp: string
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

    // Buscar user_id se não fornecido
    let targetUserId = user_id
    if (!targetUserId) {
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) throw userError
      
      const user = userData.users.find(u => u.email === email)
      if (!user) {
        throw new Error('Usuário não encontrado. Execute o SQL de criação primeiro.')
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

    console.log('Magic link data completo:', magicLinkData) // Debug completo
    const magicLink = magicLinkData?.properties?.action_link || magicLinkData?.action_link
    console.log('🔗 Magic Link gerado:', magicLink) // Debug

    // Log de envio (isolado)
    const { error: logError } = await supabase
      .from('verification_logs')
      .insert({
        user_id: targetUserId,
        email: email,
        magic_link: magicLink,
        status: 'sent',
        metadata: {
          generated_at: new Date().toISOString(),
          test_mode: true
        }
      })

    if (logError) {
      console.error('Log error:', logError)
    }

    // TODO: Enviar via SendGrid (isolado - só retorna link)
    console.log('🔗 Magic Link Gerado:', magicLink)
    console.log('📧 Enviar para:', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link gerado com sucesso (verifique logs ou e-mail)'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Verification error:', error)
    
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
