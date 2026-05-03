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
    // Extract parameters from both search query and hash fragment
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = searchParams.get("error") || hashParams.get("error");
    const errorDescription = searchParams.get("error_description") || hashParams.get("error_description");
    const rawProvider = searchParams.get("provider") || hashParams.get("provider");
    const connStatus = searchParams.get("status") || hashParams.get("status");
    const account = searchParams.get("account") || hashParams.get("account");
    const rawRedirectTo = searchParams.get("redirectTo") || hashParams.get("redirectTo");

    // Validação estrita do provider para evitar Open Redirect/XSS via payload de provider inválido
    const isValidProvider = rawProvider && Object.keys(PROVIDER_CONFIGS).includes(rawProvider);
    const provider = isValidProvider ? (rawProvider as AdProvider) : null;

    // Strict validation for redirectTo to prevent Open Redirect
    const isValidRelativeUrl = (url: string | null) => {
      if (!url) return false;
      return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
    };
    const redirectTo = isValidRelativeUrl(rawRedirectTo) ? rawRedirectTo : "/integracoes";

    // Função para sanitizar texto simples para evitar XSS ao injetar no DOM via toast/message
    const escapeHTML = (str: string) => {
      return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
          }[tag] || tag)
      );
    };

    if (error) {
      setStatus("error");
      const rawErrorText = String(errorDescription || error || "Erro desconhecido na autenticação.");
      const cleanError = escapeHTML(rawErrorText);
      setMessage(cleanError);
      toast.error(`Erro na conexão: ${cleanError}`);
    } else if (connStatus === "connected" && provider) {
      setStatus("success");
      const providerName = PROVIDER_CONFIGS[provider].name;
      const cleanAccount = account ? escapeHTML(String(account)) : "";
      setMessage(`${providerName} conectado com sucesso!${cleanAccount ? ` Conta: ${cleanAccount}` : ""}`);
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
      navigate(redirectTo as string, { replace: true });
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
