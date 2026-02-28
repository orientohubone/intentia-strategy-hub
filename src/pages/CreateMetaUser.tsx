import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, CheckCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function CreateMetaUser() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCreateUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 1. Criar usuário via signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'meta-review@orientohub.com.br',
        password: 'META_REVIEW_PASSWORD_2026', // Trocar por senha real
        options: {
          data: {
            name: 'Meta Review',
            company: 'Meta'
          }
        }
      })

      if (signUpError) throw signUpError

      // 2. Se usuário criado, criar tenant_settings
      if (signUpData.user) {
        const { error: tenantError } = await supabase
          .from('tenant_settings')
          .insert({
            user_id: signUpData.user.id,
            company_name: 'Meta',
            plan: 'professional',
            monthly_analyses_limit: 50,
            analyses_used: 0
          })

        if (tenantError) throw tenantError

        // 3. Confirmar e-mail manualmente
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          signUpData.user.id,
          { email_confirm: true }
        )

        if (confirmError) throw confirmError

        setResult({
          success: true,
          user_id: signUpData.user.id,
          email: signUpData.user.email,
          message: 'Usuário criado e confirmado com sucesso!'
        })

        toast.success('Usuário Meta Review criado!')
      }

    } catch (error: any) {
      console.error('Create user error:', error?.message || "Unknown error")
      setResult({
        success: false,
        error: error.message
      })
      toast.error('Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Criar Usuário Meta</h1>
          <p className="text-gray-600 mt-2">Criação manual para testes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Dados do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value="meta-review@orientohub.com.br" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                value="Meta Review" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Input 
                value="Meta" 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <Button 
              onClick={handleCreateUser}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando Usuário...
                </>
              ) : (
                "Criar Usuário"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="pt-6">
              {result.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Usuário Criado!</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> {result.email}</p>
                    <p><strong>User ID:</strong> {result.user_id}</p>
                    <p><strong>Status:</strong> Confirmado</p>
                  </div>
                  <Alert>
                    <AlertDescription>
                      Agora você pode testar em <code>/verify-test</code>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erro: {result.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
