import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PROVIDER_CONFIGS, type AdProvider } from "@/lib/integrationTypes";
import { supabase } from "@/integrations/supabase/client";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const provider = searchParams.get("provider") as AdProvider | null;
    const connStatus = searchParams.get("status");
    const account = searchParams.get("account");

    if (error) {
      setStatus("error");
      setMessage(errorDescription || error || "Erro desconhecido na autenticação.");
      toast.error(`Erro na conexão: ${errorDescription || error}`);
    } else if (connStatus === "connected" && provider) {
      setStatus("success");
      const providerName = PROVIDER_CONFIGS[provider]?.name || provider;
      setMessage(`${providerName} conectado com sucesso!${account ? ` Conta: ${account}` : ""}`);
      toast.success(`${providerName} conectado com sucesso!`);
    } else {
      setStatus("processing");
      setMessage("Processando autenticação...");
    }

    // Wait for Supabase session to be restored before redirecting
    const redirectWhenReady = async () => {
      // Give Supabase client time to restore session from localStorage
      let retries = 0;
      while (retries < 10) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) break;
        await new Promise((r) => setTimeout(r, 500));
        retries++;
      }
      navigate("/integracoes", { replace: true });
    };

    const delay = status === "error" ? 3000 : 2000;
    const timer = setTimeout(redirectWhenReady, delay);

    return () => clearTimeout(timer);
  }, [searchParams, navigate, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 max-w-md">
        {status === "processing" && (
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        )}
        {status === "error" && (
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        )}

        <h1 className="text-xl font-semibold">
          {status === "processing" && "Conectando..."}
          {status === "success" && "Conectado!"}
          {status === "error" && "Erro na Conexão"}
        </h1>

        <p className="text-sm text-muted-foreground">{message}</p>

        <p className="text-xs text-muted-foreground">
          Redirecionando para Integrações...
        </p>
      </div>
    </div>
  );
}
