import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/Loading";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { ForceLightMode } from "@/components/ForceLightMode";
import { FeatureGate } from "@/components/FeatureGate";
import { AnimatePresence } from "framer-motion";

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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><ForceLightMode><Index /></ForceLightMode></PageTransition>} />
        <Route path="/precos" element={<PageTransition><ForceLightMode><Pricing /></ForceLightMode></PageTransition>} />
        <Route path="/auth" element={<PageTransition><ForceLightMode><Auth /></ForceLightMode></PageTransition>} />
        <Route path="/assinar" element={<PageTransition><ForceLightMode><Subscribe /></ForceLightMode></PageTransition>} />
        <Route path="/sobre" element={<PageTransition><ForceLightMode><About /></ForceLightMode></PageTransition>} />
        <Route path="/cases" element={<PageTransition><ForceLightMode><Cases /></ForceLightMode></PageTransition>} />
        <Route path="/blog" element={<PageTransition><ForceLightMode><Blog /></ForceLightMode></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><ForceLightMode><BlogPost /></ForceLightMode></PageTransition>} />
        <Route path="/contato" element={<PageTransition><ForceLightMode><Contact /></ForceLightMode></PageTransition>} />
        <Route path="/politica-de-privacidade" element={<PageTransition><ForceLightMode><PrivacyPolicy /></ForceLightMode></PageTransition>} />
        <Route path="/termos-de-servico" element={<PageTransition><ForceLightMode><TermsOfService /></ForceLightMode></PageTransition>} />
        <Route path="/politica-de-cookies" element={<PageTransition><ForceLightMode><CookiePolicy /></ForceLightMode></PageTransition>} />
        <Route path="/exclusao-de-dados" element={<PageTransition><ForceLightMode><DataDeletion /></ForceLightMode></PageTransition>} />
        <Route path="/brand" element={<PageTransition><ForceLightMode><BrandGuide /></ForceLightMode></PageTransition>} />
        <Route path="/brand/posts" element={<PageTransition><ForceLightMode><BrandPosts /></ForceLightMode></PageTransition>} />
        <Route path="/brand/google-ads-doc" element={<PageTransition><ForceLightMode><GoogleAdsDesignDoc /></ForceLightMode></PageTransition>} />
        <Route path="/seguranca" element={<PageTransition><ForceLightMode><Security /></ForceLightMode></PageTransition>} />
        <Route path="/status" element={<PageTransition><ForceLightMode><Status /></ForceLightMode></PageTransition>} />
        <Route path="/plano-tatico" element={<PageTransition><ForceLightMode><TacticalPlanPage /></ForceLightMode></PageTransition>} />
        <Route path="/comparar" element={<PageTransition><ForceLightMode><Comparar /></ForceLightMode></PageTransition>} />
        <Route path="/changelog" element={<PageTransition><ForceLightMode><Changelog /></ForceLightMode></PageTransition>} />
        <Route path="/diagnostico-url" element={<PageTransition><ForceLightMode><FeatureDiagnostico /></ForceLightMode></PageTransition>} />
        <Route path="/analise-ia" element={<PageTransition><ForceLightMode><FeatureAnaliseIA /></ForceLightMode></PageTransition>} />
        <Route path="/benchmark-competitivo" element={<PageTransition><ForceLightMode><FeatureBenchmark /></ForceLightMode></PageTransition>} />
        <Route path="/score-canal" element={<PageTransition><ForceLightMode><FeatureScoreCanal /></ForceLightMode></PageTransition>} />
        <Route path="/alertas-insights" element={<PageTransition><ForceLightMode><FeatureInsights /></ForceLightMode></PageTransition>} />
        <Route path="/dados-estruturados" element={<PageTransition><ForceLightMode><FeatureDadosEstruturados /></ForceLightMode></PageTransition>} />
        <Route path="/gestao-campanhas" element={<PageTransition><ForceLightMode><FeatureGestaoCampanhas /></ForceLightMode></PageTransition>} />
        <Route path="/gestao-budget" element={<PageTransition><ForceLightMode><FeatureGestaoBudget /></ForceLightMode></PageTransition>} />
        <Route path="/monitoramento-seo-inteligente" element={<PageTransition><ForceLightMode><FeatureSeoMonitoring /></ForceLightMode></PageTransition>} />
        <Route path="/relatorios" element={<PageTransition><ForceLightMode><FeatureRelatorios /></ForceLightMode></PageTransition>} />
        <Route path="/tia" element={<PageTransition><TiaPage /></PageTransition>} />
        <Route path="/verify-test" element={<PageTransition><ForceLightMode><VerifyTest /></ForceLightMode></PageTransition>} />
        <Route path="/verify-success" element={<PageTransition><ForceLightMode><VerifySuccess /></ForceLightMode></PageTransition>} />
        <Route path="/create-meta-user" element={<PageTransition><ForceLightMode><CreateMetaUser /></ForceLightMode></PageTransition>} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PageTransition><Home /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <PageTransition><Projects /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <PageTransition><Insights /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audiences"
          element={
            <ProtectedRoute>
              <PageTransition><Audiences /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/benchmark"
          element={
            <ProtectedRoute>
              <PageTransition><Benchmark /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageTransition><Settings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tactical"
          element={
            <ProtectedRoute>
              <PageTransition><TacticalPlan /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <PageTransition><Checkout /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <ProtectedRoute>
              <PageTransition><Alerts /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations"
          element={
            <ProtectedRoute>
              <PageTransition><Operations /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/operations/live-dashboard" element={<PageTransition><OperationsLiveDashboard /></PageTransition>} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <FeatureGate featureKey="reports_feature">
                <PageTransition><Reports /></PageTransition>
              </FeatureGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <PageTransition><Help /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <PageTransition><Support /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/integracoes"
          element={
            <ProtectedRoute>
              <PageTransition><Integrations /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/apps"
          element={
            <ProtectedRoute>
              <PageTransition><AppStore /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seo-geo"
          element={
            <ProtectedRoute>
              <FeatureGate featureKey="seo_analysis">
                <PageTransition><SeoGeo /></PageTransition>
              </FeatureGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seo-monitoring"
          element={
            <ProtectedRoute>
              <FeatureGate featureKey="performance_monitoring">
                <PageTransition><SeoMonitoring /></PageTransition>
              </FeatureGate>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <PageTransition><AdminPanel /></PageTransition>
            </AdminProtectedRoute>
          }
        />
        <Route path="/oauth/callback" element={<PageTransition><OAuthCallback /></PageTransition>} />
        <Route path="/api/status-rss" element={<PageTransition><StatusRssFallback /></PageTransition>} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><ForceLightMode><NotFound /></ForceLightMode></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
