import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/home";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          }
        }
      });

      if (error) throw error;

      // Tenant settings é criado automaticamente pelo trigger handle_new_user
      // Não precisa criar manualmente
      
      // Verificar se confirmação de email está desativada
      if (signUpData.user && !signUpData.user.email_confirmed_at) {
        // Email confirmation ativada - fluxo normal
        toast.success("Conta criada com sucesso! Verifique seu email.");
        setMode("signin");
        setFormData({ email: "", password: "", fullName: "", companyName: "" });
      } else {
        // Email confirmation desativada - redirecionar direto
        toast.success("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Informe seu email para redefinir a senha.");
      return;
    }
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success("Email de redefinição enviado! Verifique sua caixa de entrada.");
      setMode("signin");
    } catch (error: any) {
      console.error("resetPasswordForEmail", error);
      toast.error(error?.message || "Erro ao enviar email de redefinição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEO title="Entrar" path="/auth" description="Acesse sua conta na Intentia. Plataforma de inteligência estratégica para marketing B2B." noindex />
      <BackToHomeButton />

      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-16 lg:px-20 py-8 sm:py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-4xl font-extrabold tracking-tight text-gray-900">
              intentia<span className="text-primary">.</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {mode === "signin" ? "Sign In" : mode === "signup" ? "Sign Up" : "Redefinir Senha"}
          </h1>

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgotPassword} className="space-y-6">
            {mode === "forgot" && (
              <p className="text-sm text-gray-500 -mt-2 mb-2">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </p>
            )}

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-800 text-sm font-medium">Nome Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="João Silva"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="h-12 border-0 bg-gray-100 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-800 text-sm font-medium">Empresa</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    placeholder="Sua Empresa Ltda"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="h-12 border-0 bg-gray-100 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 border-0 bg-gray-100 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 border-0 bg-gray-100 rounded-lg pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="text-sm">
                <span className="text-gray-500">Esqueceu sua </span>
                <button
                  type="button"
                  className="text-primary font-medium hover:text-primary/80 hover:underline transition-colors"
                  onClick={() => {
                    setMode("forgot");
                    setFormData(prev => ({ ...prev, password: "" }));
                  }}
                >
                  senha
                </button>
                <span className="text-gray-500">?</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full gradient-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:opacity-90 transition-all duration-300"
            >
              {loading
                ? (mode === "forgot" ? "Enviando..." : mode === "signin" ? "Entrando..." : "Cadastrando...")
                : (mode === "forgot" ? "Enviar link de redefinição" : mode === "signin" ? "Login" : "Criar Conta")}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-gray-500 mt-8">
            {mode === "forgot" ? (
              <>
                Lembrou a senha?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setFormData({ email: "", password: "", fullName: "", companyName: "" });
                  }}
                  className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
                >
                  Voltar ao login
                </button>
              </>
            ) : (
              <>
                {mode === "signin" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setFormData({ email: "", password: "", fullName: "", companyName: "" });
                  }}
                  className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right: Gradient panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center items-center px-12 xl:px-20 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            {mode === "forgot" ? "Recupere seu acesso" : mode === "signin" ? "Bem-vindo de volta!" : "Junte-se a nós!"}
          </h2>
          <p className="text-white/85 text-base xl:text-lg leading-relaxed">
            {mode === "forgot"
              ? "Enviaremos um link seguro para o seu email. Use-o para criar uma nova senha e voltar a acessar sua plataforma."
              : mode === "signin"
              ? "Acesse sua plataforma de estratégia de mídia B2B. Analise concorrentes, descubra oportunidades e tome decisões baseadas em dados reais."
              : "Comece a transformar sua estratégia de marketing B2B com análises inteligentes, benchmarks competitivos e insights acionáveis."}
          </p>
        </div>
      </div>
    </div>
  );
}
