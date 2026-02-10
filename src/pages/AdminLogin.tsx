import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Lock, Building2, AlertTriangle } from "lucide-react";
import { adminLogin, formatCnpj, isValidCnpj, cleanCnpj } from "@/lib/adminAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCnpj(e.target.value));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = cleanCnpj(cnpj);
    if (!isValidCnpj(cleaned)) {
      setError("CNPJ inválido. Verifique os dígitos.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const result = await adminLogin(cnpj, password);
    setLoading(false);

    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.error || "Erro ao autenticar.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            intentia<span className="text-primary">.</span> <span className="text-lg font-normal text-slate-400">admin</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Painel Administrativo</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm text-slate-300">
                CNPJ
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-300">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary focus:ring-primary/20"
                  autoComplete="new-password"
                  data-1p-ignore
                  data-lpignore="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !cnpj || !password}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-11"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Autenticando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Acessar Painel
                </div>
              )}
            </Button>
          </form>

          {/* Security notice */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Acesso restrito. Tentativas de login são monitoradas e limitadas.
                Após 5 tentativas incorretas, a conta é bloqueada por 15 minutos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-700 mt-6">
          Intentia Strategy Hub — Painel Administrativo
        </p>
      </div>
    </div>
  );
}
