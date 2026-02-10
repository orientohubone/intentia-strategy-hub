import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = "card" | "pix" | "boleto";

const PLANS: Record<string, {
  label: string;
  price: number;
  priceLabel: string;
  period: string;
  features: string[];
}> = {
  professional: {
    label: "Professional",
    price: 97,
    priceLabel: "R$ 97",
    period: "/mês",
    features: [
      "Projetos ilimitados",
      "Diagnóstico heurístico de URL (6 dimensões)",
      "Análise por IA — Gemini e Claude (use sua API key)",
      "Score por canal com riscos e recomendações",
      "Benchmark competitivo com SWOT e gap analysis",
      "Plano Tático por canal (campanha, funil, copy, segmentação)",
      "Alertas estratégicos consolidados",
      "Insights agrupados por projeto",
      "Públicos-alvo ilimitados com keywords",
      "Exportação PDF e CSV",
      "Notificações em tempo real",
      "Suporte prioritário",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: 0,
    priceLabel: "Personalizado",
    period: "",
    features: [
      "Tudo do Professional",
      "API access completo",
      "Múltiplos usuários por conta",
      "SLA dedicado com suporte 24/7",
      "Consultoria estratégica mensal",
      "Onboarding e treinamento da equipe",
      "Integrações customizadas",
      "Relatórios white-label",
    ],
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get("plan") || "professional";
  const plan = PLANS[planKey];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Redirect to contact for enterprise
  useEffect(() => {
    if (planKey === "enterprise") {
      navigate("/contato");
    }
  }, [planKey, navigate]);

  if (!plan || planKey === "enterprise") return null;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async () => {
    if (paymentMethod === "card") {
      const num = cardData.number.replace(/\s/g, "");
      if (num.length < 16) { toast.error("Número do cartão inválido"); return; }
      if (!cardData.name.trim()) { toast.error("Nome no cartão é obrigatório"); return; }
      if (cardData.expiry.length < 5) { toast.error("Validade inválida"); return; }
      if (cardData.cvv.length < 3) { toast.error("CVV inválido"); return; }
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Update tenant plan
      const { error } = await (supabase
        .from("tenant_settings") as any)
        .update({
          plan: planKey,
          monthly_analyses_limit: 999,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Create notification
      await (supabase.from("notifications") as any).insert({
        user_id: user.id,
        type: "system",
        title: "Upgrade realizado com sucesso!",
        message: `Seu plano foi atualizado para ${plan.label}. Todos os recursos premium já estão disponíveis.`,
      });

      setCompleted(true);
      toast.success("Pagamento confirmado! Seu plano foi atualizado.");
    } catch (error: any) {
      toast.error("Erro ao processar upgrade: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Success screen
  if (completed) {
    return (
      <DashboardLayout>
        <SEO title="Checkout" noindex />
        <div className="max-w-lg mx-auto py-8 sm:py-16 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Upgrade Concluído!</h1>
            <p className="text-muted-foreground">
              Seu plano foi atualizado para <strong>{plan.label}</strong>. Todos os recursos premium já estão disponíveis.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Agora você tem acesso a:
            </p>
            {plan.features.slice(0, 6).map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-1">
              E mais {plan.features.length - 6} recursos...
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" onClick={() => navigate("/dashboard")}>
              Ir para o Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              Ver Configurações
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Checkout" noindex />
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground">
              Finalize seu upgrade para o plano {plan.label}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Payment Form — 3 cols */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {([
                    { key: "card" as PaymentMethod, icon: CreditCard, label: "Cartão" },
                    { key: "pix" as PaymentMethod, icon: QrCode, label: "PIX" },
                    { key: "boleto" as PaymentMethod, icon: Receipt, label: "Boleto" },
                  ]).map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method.key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <method.icon className={`h-5 w-5 ${paymentMethod === method.key ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs sm:text-sm font-medium ${paymentMethod === method.key ? "text-primary" : "text-muted-foreground"}`}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Card Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-number">Número do Cartão</Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={(e) => setCardData((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                        maxLength={19}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-name">Nome no Cartão</Label>
                      <Input
                        id="card-name"
                        placeholder="Como aparece no cartão"
                        value={cardData.name}
                        onChange={(e) => setCardData((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="card-expiry">Validade</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                          maxLength={5}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-cvv">CVV</Label>
                        <Input
                          id="card-cvv"
                          placeholder="000"
                          value={cardData.cvv}
                          onChange={(e) => setCardData((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          maxLength={4}
                          type="password"
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX */}
                {paymentMethod === "pix" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="h-40 w-40 mx-auto rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <QrCode className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">QR Code PIX</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        O código PIX será gerado após confirmar. Válido por 30 minutos.
                      </p>
                    </div>
                  </div>
                )}

                {/* Boleto */}
                {paymentMethod === "boleto" && (
                  <div className="text-center py-6 space-y-4">
                    <div className="h-20 w-full mx-auto rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <Receipt className="h-8 w-8 text-muted-foreground/50 mr-2" />
                      <span className="text-sm text-muted-foreground">Boleto Bancário</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Boleto Bancário</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        O boleto será gerado após confirmar. Prazo de compensação: 1-3 dias úteis.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-2 px-1">
              <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Pagamento seguro com criptografia SSL. Seus dados nunca são armazenados em nossos servidores.
              </p>
            </div>
          </div>

          {/* Order Summary — 2 cols */}
          <div className="lg:col-span-2">
            <Card className="border-primary/30 sticky top-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Plano {plan.label}</p>
                    <p className="text-xs text-muted-foreground">Assinatura mensal</p>
                  </div>
                  <Badge className="bg-primary">Upgrade</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  {plan.features.slice(0, 5).map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pl-5">
                    + {plan.features.length - 5} recursos inclusos
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plano {plan.label}</span>
                    <span className="text-foreground">{plan.priceLabel}</span>
                  </div>
                  {paymentMethod === "boleto" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxa boleto</span>
                      <span className="text-foreground">R$ 0,00</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-foreground">{plan.priceLabel}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      {paymentMethod === "card" && "Confirmar Pagamento"}
                      {paymentMethod === "pix" && "Gerar QR Code PIX"}
                      {paymentMethod === "boleto" && "Gerar Boleto"}
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                  Ao confirmar, você concorda com os{" "}
                  <a href="/termos-de-servico" className="underline hover:text-foreground">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="/politica-de-privacidade" className="underline hover:text-foreground">
                    Política de Privacidade
                  </a>
                  . Você pode cancelar a qualquer momento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
