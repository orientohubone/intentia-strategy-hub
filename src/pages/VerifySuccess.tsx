import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, User, Mail, ArrowRight } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

export default function VerifySuccess() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        
        // Log de clique no link (opcional)
        if (session.user.email) {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-verify-click`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              email: session.user.email,
              user_id: session.user.id 
            })
          }).catch(() => {
            // Silently fail - é apenas log
          })
        }
      }
    } catch (error) {
      console.error('Session check error:', error?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Sessão não encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Não conseguimos verificar sua sessão. Tente fazer login novamente.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">E-mail Verificado!</h1>
          <p className="text-gray-600 mt-2">
            Sua conta foi verificada com sucesso
          </p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Verificado e Logado
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">E-mail:</span>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">User ID:</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {user.id.slice(0, 8)}...
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Confirmado em:</span>
                <span className="text-sm">
                  {user.email_confirmed_at ? 
                    new Date(user.email_confirmed_at).toLocaleString('pt-BR') : 
                    'Agora'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p className="text-sm text-gray-600">
                  Sua sessão foi criada automaticamente
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <p className="text-sm text-gray-600">
                  Você já pode acessar todas as funcionalidades
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <p className="text-sm text-gray-600">
                  Complete seu perfil se necessário
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Ir para Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Info */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs">!</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">
                  Modo de Teste
                </p>
                <p className="text-xs text-yellow-700">
                  Esta é uma página de teste do Fluxo B de verificação. 
                  Em produção, o usuário seria redirecionado automaticamente após clicar no link no e-mail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
