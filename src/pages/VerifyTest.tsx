import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function VerifyTest() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleRequestVerify = async () => {
    if (!email) {
      toast.error("Digite um e-mail")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      )

      const data = await response.json()

      if (data.success) {
        setResult(data)
        toast.success("Magic link gerado com sucesso!")
      } else {
        setError(data.error || "Erro ao gerar link")
        toast.error("Erro ao gerar magic link")
      }
    } catch (err: any) {
      setError(err.message)
      toast.error("Erro na requisição")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Teste: Verificação por E-mail</h1>
          <p className="text-gray-600 mt-2">Fluxo B isolado - Magic Link via Edge Function</p>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gerar Magic Link
            </CardTitle>
            <CardDescription>
              Digite o e-mail do usuário para gerar um magic link de verificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail do Usuário</label>
              <Input
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={handleRequestVerify}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Magic Link...
                </>
              ) : (
                "Gerar Magic Link"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Magic Link Gerado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Sucesso
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    O magic link foi gerado e enviado para o log interno (ou e-mail).
                    Por favor, verifique a tabela <code>verification_logs</code> ou os logs da Edge Function.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Seguro:</strong> O link não é mais retornado diretamente na resposta por motivos de segurança.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <p><strong>1.</strong> Execute o SQL <code>verify_isolated_setup.sql</code></p>
              <p><strong>2.</strong> Deploy da Edge Function: <code>supabase functions deploy request-verify</code></p>
              <p><strong>3.</strong> Configure secrets: <code>SUPABASE_SERVICE_ROLE_KEY</code></p>
              <p><strong>4.</strong> Teste com e-mail existente no Supabase Auth</p>
              <p><strong>5.</strong> Verifique os logs para obter o link gerado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
