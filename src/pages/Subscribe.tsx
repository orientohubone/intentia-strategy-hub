import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "card" | "pix" | "boleto";
type Step = "payment" | "processing" | "success";

const PLAN = {
  label: "Professional",
  price: 147,
  priceLabel: "R$ 147",
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
};

export default function Subscribe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>("payment");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Account data
  const [account, setAccount] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
  });

  // Card data
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validateForm = (): boolean => {
    if (!account.fullName.trim()) { toast.error("Nome completo é obrigatório"); return false; }
    if (!account.email.trim()) { toast.error("Email é obrigatório"); return false; }
    if (!account.email.includes("@")) { toast.error("Email inválido"); return false; }
    if (account.password.length < 6) { toast.error("Senha deve ter no mínimo 6 caracteres"); return false; }

    if (paymentMethod === "card") {
      const num = cardData.number.replace(/\s/g, "");
      if (num.length < 16) { toast.error("Número do cartão inválido"); return false; }
      if (!cardData.name.trim()) { toast.error("Nome no cartão é obrigatório"); return false; }
      if (cardData.expiry.length < 5) { toast.error("Validade inválida"); return false; }
      if (cardData.cvv.length < 3) { toast.error("CVV inválido"); return false; }
    }

    return true;
  };

  const handleSubmit = async () => {
    // Payment gateway (Stripe) not yet integrated — block fake subscriptions
    toast.info("Integração de pagamento em desenvolvimento. Crie uma conta gratuita (Starter) e faça upgrade quando o pagamento estiver disponível.");
  };

  // Processing screen
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="relative mx-auto w-16 h-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Processando pagamento...</h2>
            <p className="text-sm text-muted-foreground">
              Estamos confirmando seu pagamento e criando sua conta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto py-24 sm:py-32 px-4 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Assinatura Confirmada!</h1>
            <p className="text-muted-foreground">
              Sua conta <strong>{account.email}</strong> foi criada com o plano <strong>Professional</strong> ativo.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Você tem acesso a:
            </p>
            {PLAN.features.slice(0, 6).map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-1">
              E mais {PLAN.features.length - 6} recursos...
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-foreground">
              <strong>Importante:</strong> Verifique seu email para confirmar a conta. Após confirmar, faça login para acessar a plataforma.
            </p>
          </div>

          <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
            Fazer Login
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Main checkout form
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Assinar Professional" path="/assinar" description="Assine o plano Professional da Intentia: projetos ilimitados, análise por IA, benchmark SWOT, plano tático e exportação completa." noindex />
      <Header />

      <section className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge className="bg-primary mb-3">
              <Crown className="h-3 w-3 mr-1" />
              Plano Professional
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Assine o plano Professional
            </h1>
            <p className="text-muted-foreground">
              Preencha seus dados, escolha a forma de pagamento e comece a usar imediatamente.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Forms — 3 cols */}
            <div className="lg:col-span-3 space-y-5">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sub-name">Nome Completo *</Label>
                      <Input
                        id="sub-name"
                        placeholder="João Silva"
                        value={account.fullName}
                        onChange={(e) => setAccount((p) => ({ ...p, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sub-company">Empresa</Label>
                      <Input
                        id="sub-company"
                        placeholder="Sua Empresa Ltda"
                        value={account.companyName}
                        onChange={(e) => setAccount((p) => ({ ...p, companyName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sub-email">Email *</Label>
                    <Input
                      id="sub-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={account.email}
                      onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sub-password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="sub-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={account.password}
                        onChange={(e) => setAccount((p) => ({ ...p, password: e.target.value }))}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Esses serão seus dados de acesso à plataforma após o pagamento.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pagamento
                  </CardTitle>
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
                        <Label htmlFor="sub-card-number">Número do Cartão</Label>
                        <Input
                          id="sub-card-number"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.number}
                          onChange={(e) => setCardData((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                          maxLength={19}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sub-card-name">Nome no Cartão</Label>
                        <Input
                          id="sub-card-name"
                          placeholder="Como aparece no cartão"
                          value={cardData.name}
                          onChange={(e) => setCardData((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="sub-card-expiry">Validade</Label>
                          <Input
                            id="sub-card-expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                            maxLength={5}
                            className="font-mono"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sub-card-cvv">CVV</Label>
                          <Input
                            id="sub-card-cvv"
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
                          O boleto será gerado após confirmar. Sua conta será criada após a compensação (1-3 dias úteis).
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security */}
              <div className="flex items-center gap-2 px-1">
                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Pagamento seguro com criptografia SSL. Seus dados nunca são armazenados em nossos servidores.
                </p>
              </div>
            </div>

            {/* Right: Order Summary — 2 cols */}
            <div className="lg:col-span-2">
              <Card className="border-primary/30 lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Plano {PLAN.label}</p>
                      <p className="text-xs text-muted-foreground">Assinatura mensal</p>
                    </div>
                    <Badge className="bg-primary">Professional</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {PLAN.features.slice(0, 5).map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">{f}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pl-5">
                      + {PLAN.features.length - 5} recursos inclusos
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plano {PLAN.label}</span>
                      <span className="text-foreground">{PLAN.priceLabel}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-foreground">{PLAN.priceLabel}</span>
                        <span className="text-sm text-muted-foreground">{PLAN.period}</span>
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
                        {paymentMethod === "card" && "Pagar e Criar Conta"}
                        {paymentMethod === "pix" && "Gerar PIX e Criar Conta"}
                        {paymentMethod === "boleto" && "Gerar Boleto e Criar Conta"}
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
      </section>

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
