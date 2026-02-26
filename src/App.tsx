import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/Loading";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { ForceLightMode } from "@/components/ForceLightMode";
import { FeatureGate } from "@/components/FeatureGate";

const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Cases = lazy(() => import("./pages/Cases"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const Projects = lazy(() => import("./pages/Projects"));
const Insights = lazy(() => import("./pages/Insights"));
const Audiences = lazy(() => import("./pages/Audiences"));
const Benchmark = lazy(() => import("./pages/Benchmark"));
const Settings = lazy(() => import("./pages/Settings"));
const TacticalPlan = lazy(() => import("./pages/TacticalPlan"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Operations = lazy(() => import("./pages/Operations"));
const OperationsLiveDashboard = lazy(() => import("./pages/Operations/LiveDashboard"));
const Reports = lazy(() => import("./pages/Reports"));
const FeatureRelatorios = lazy(() => import("./pages/FeatureRelatorios"));
const Help = lazy(() => import("./pages/Help"));
const Support = lazy(() => import("./pages/Support"));
const Integrations = lazy(() => import("./pages/Integrations"));
const SeoGeo = lazy(() => import("./pages/SeoGeo"));
const SeoMonitoring = lazy(() => import("./pages/SeoMonitoring"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BrandGuide = lazy(() => import("./pages/BrandGuide"));
const BrandPosts = lazy(() => import("./pages/BrandPosts"));
const GoogleAdsDesignDoc = lazy(() => import("./pages/GoogleAdsDesignDoc"));
const Security = lazy(() => import("./pages/Security"));
const TacticalPlanPage = lazy(() => import("./pages/TacticalPlanPage"));
const Status = lazy(() => import("./pages/Status"));
const Comparar = lazy(() => import("./pages/Comparar"));
const FeatureDiagnostico = lazy(() => import("./pages/FeatureDiagnostico"));
const FeatureAnaliseIA = lazy(() => import("./pages/FeatureAnaliseIA"));
const FeatureBenchmark = lazy(() => import("./pages/FeatureBenchmark"));
const FeatureScoreCanal = lazy(() => import("./pages/FeatureScoreCanal"));
const FeatureInsights = lazy(() => import("./pages/FeatureInsights"));
const FeatureDadosEstruturados = lazy(() => import("./pages/FeatureDadosEstruturados"));
const FeatureGestaoCampanhas = lazy(() => import("./pages/FeatureGestaCampanhas"));
const FeatureGestaoBudget = lazy(() => import("./pages/FeatureGestaoBudget"));
const FeatureSeoMonitoring = lazy(() => import("./pages/FeatureSeoMonitoring"));
const AppStore = lazy(() => import("./pages/AppStore"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const StatusRssFallback = lazy(() => import("./pages/StatusRssFallback"));
const TiaPage = lazy(() => import("./pages/Tia"));
const Changelog = lazy(() => import("./pages/Changelog"));
const VerifyTest = lazy(() => import("./pages/VerifyTest"));
const VerifySuccess = lazy(() => import("./pages/VerifySuccess"));
const CreateMetaUser = lazy(() => import("./pages/CreateMetaUser"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<ForceLightMode><Index /></ForceLightMode>} />
            <Route path="/precos" element={<ForceLightMode><Pricing /></ForceLightMode>} />
            <Route path="/auth" element={<ForceLightMode><Auth /></ForceLightMode>} />
            <Route path="/assinar" element={<ForceLightMode><Subscribe /></ForceLightMode>} />
            <Route path="/sobre" element={<ForceLightMode><About /></ForceLightMode>} />
            <Route path="/cases" element={<ForceLightMode><Cases /></ForceLightMode>} />
            <Route path="/blog" element={<ForceLightMode><Blog /></ForceLightMode>} />
            <Route path="/blog/:slug" element={<ForceLightMode><BlogPost /></ForceLightMode>} />
            <Route path="/contato" element={<ForceLightMode><Contact /></ForceLightMode>} />
            <Route path="/politica-de-privacidade" element={<ForceLightMode><PrivacyPolicy /></ForceLightMode>} />
            <Route path="/termos-de-servico" element={<ForceLightMode><TermsOfService /></ForceLightMode>} />
            <Route path="/politica-de-cookies" element={<ForceLightMode><CookiePolicy /></ForceLightMode>} />
            <Route path="/exclusao-de-dados" element={<ForceLightMode><DataDeletion /></ForceLightMode>} />
            <Route path="/brand" element={<ForceLightMode><BrandGuide /></ForceLightMode>} />
            <Route path="/brand/posts" element={<ForceLightMode><BrandPosts /></ForceLightMode>} />
            <Route path="/brand/google-ads-doc" element={<ForceLightMode><GoogleAdsDesignDoc /></ForceLightMode>} />
            <Route path="/seguranca" element={<ForceLightMode><Security /></ForceLightMode>} />
            <Route path="/status" element={<ForceLightMode><Status /></ForceLightMode>} />
            <Route path="/plano-tatico" element={<ForceLightMode><TacticalPlanPage /></ForceLightMode>} />
            <Route path="/comparar" element={<ForceLightMode><Comparar /></ForceLightMode>} />
            <Route path="/changelog" element={<ForceLightMode><Changelog /></ForceLightMode>} />
            <Route path="/diagnostico-url" element={<ForceLightMode><FeatureDiagnostico /></ForceLightMode>} />
            <Route path="/analise-ia" element={<ForceLightMode><FeatureAnaliseIA /></ForceLightMode>} />
            <Route path="/benchmark-competitivo" element={<ForceLightMode><FeatureBenchmark /></ForceLightMode>} />
            <Route path="/score-canal" element={<ForceLightMode><FeatureScoreCanal /></ForceLightMode>} />
            <Route path="/alertas-insights" element={<ForceLightMode><FeatureInsights /></ForceLightMode>} />
            <Route path="/dados-estruturados" element={<ForceLightMode><FeatureDadosEstruturados /></ForceLightMode>} />
            <Route path="/gestao-campanhas" element={<ForceLightMode><FeatureGestaoCampanhas /></ForceLightMode>} />
            <Route path="/gestao-budget" element={<ForceLightMode><FeatureGestaoBudget /></ForceLightMode>} />
            <Route path="/monitoramento-seo-inteligente" element={<ForceLightMode><FeatureSeoMonitoring /></ForceLightMode>} />
            <Route path="/relatorios" element={<ForceLightMode><FeatureRelatorios /></ForceLightMode>} />
            <Route path="/tia" element={<TiaPage />} />
            <Route path="/verify-test" element={<ForceLightMode><VerifyTest /></ForceLightMode>} />
            <Route path="/verify-success" element={<ForceLightMode><VerifySuccess /></ForceLightMode>} />
            <Route path="/create-meta-user" element={<ForceLightMode><CreateMetaUser /></ForceLightMode>} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audiences"
              element={
                <ProtectedRoute>
                  <Audiences />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benchmark"
              element={
                <ProtectedRoute>
                  <Benchmark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tactical"
              element={
                <ProtectedRoute>
                  <TacticalPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alertas"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations"
              element={
                <ProtectedRoute>
                  <Operations />
                </ProtectedRoute>
              }
            />
            <Route path="/operations/live-dashboard" element={<OperationsLiveDashboard />} />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <FeatureGate featureKey="reports_feature">
                    <Reports />
                  </FeatureGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integracoes"
              element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps"
              element={
                <ProtectedRoute>
                  <AppStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seo-geo"
              element={
                <ProtectedRoute>
                  <FeatureGate featureKey="seo_analysis">
                    <SeoGeo />
                  </FeatureGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seo-monitoring"
              element={
                <ProtectedRoute>
                  <FeatureGate featureKey="performance_monitoring">
                    <SeoMonitoring />
                  </FeatureGate>
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              }
            />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/api/status-rss" element={<StatusRssFallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<ForceLightMode><NotFound /></ForceLightMode>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
