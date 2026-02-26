import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, useEffect } from "react";
import { Loading } from "@/components/Loading";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { ForceLightMode } from "@/components/ForceLightMode";
import { FeatureGate } from "@/components/FeatureGate";
import { lazyWithPreload } from "@/utils/lazyWithPreload";

// Use lazyWithPreload for critical routes
const Index = lazyWithPreload(() => import("./pages/Index"));
const Dashboard = lazyWithPreload(() => import("./pages/Dashboard"));
const Home = lazyWithPreload(() => import("./pages/Home"));
const Projects = lazyWithPreload(() => import("./pages/Projects"));
const Insights = lazyWithPreload(() => import("./pages/Insights"));
const Audiences = lazyWithPreload(() => import("./pages/Audiences"));
const Benchmark = lazyWithPreload(() => import("./pages/Benchmark"));
const Settings = lazyWithPreload(() => import("./pages/Settings"));
const TacticalPlan = lazyWithPreload(() => import("./pages/TacticalPlan"));
const Alerts = lazyWithPreload(() => import("./pages/Alerts"));
const Operations = lazyWithPreload(() => import("./pages/Operations"));
const Reports = lazyWithPreload(() => import("./pages/Reports"));

// Less critical routes can remain standard lazy or also use lazyWithPreload if desired
// For simplicity and robustness, using lazyWithPreload for all significantly interactive pages
const Pricing = lazyWithPreload(() => import("./pages/Pricing"));
const Auth = lazyWithPreload(() => import("./pages/Auth"));
const About = lazyWithPreload(() => import("./pages/About"));
const Cases = lazyWithPreload(() => import("./pages/Cases"));
const Blog = lazyWithPreload(() => import("./pages/Blog"));
const BlogPost = lazyWithPreload(() => import("./pages/BlogPost"));
const Contact = lazyWithPreload(() => import("./pages/Contact"));
const PrivacyPolicy = lazyWithPreload(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazyWithPreload(() => import("./pages/TermsOfService"));
const CookiePolicy = lazyWithPreload(() => import("./pages/CookiePolicy"));
const DataDeletion = lazyWithPreload(() => import("./pages/DataDeletion"));
const OperationsLiveDashboard = lazyWithPreload(() => import("./pages/Operations/LiveDashboard"));
const FeatureRelatorios = lazyWithPreload(() => import("./pages/FeatureRelatorios"));
const Help = lazyWithPreload(() => import("./pages/Help"));
const Support = lazyWithPreload(() => import("./pages/Support"));
const Integrations = lazyWithPreload(() => import("./pages/Integrations"));
const SeoGeo = lazyWithPreload(() => import("./pages/SeoGeo"));
const SeoMonitoring = lazyWithPreload(() => import("./pages/SeoMonitoring"));
const Checkout = lazyWithPreload(() => import("./pages/Checkout"));
const Subscribe = lazyWithPreload(() => import("./pages/Subscribe"));
const OAuthCallback = lazyWithPreload(() => import("./pages/OAuthCallback"));
const NotFound = lazyWithPreload(() => import("./pages/NotFound"));
const BrandGuide = lazyWithPreload(() => import("./pages/BrandGuide"));
const BrandPosts = lazyWithPreload(() => import("./pages/BrandPosts"));
const GoogleAdsDesignDoc = lazyWithPreload(() => import("./pages/GoogleAdsDesignDoc"));
const Security = lazyWithPreload(() => import("./pages/Security"));
const TacticalPlanPage = lazyWithPreload(() => import("./pages/TacticalPlanPage"));
const Status = lazyWithPreload(() => import("./pages/Status"));
const Comparar = lazyWithPreload(() => import("./pages/Comparar"));
const FeatureDiagnostico = lazyWithPreload(() => import("./pages/FeatureDiagnostico"));
const FeatureAnaliseIA = lazyWithPreload(() => import("./pages/FeatureAnaliseIA"));
const FeatureBenchmark = lazyWithPreload(() => import("./pages/FeatureBenchmark"));
const FeatureScoreCanal = lazyWithPreload(() => import("./pages/FeatureScoreCanal"));
const FeatureInsights = lazyWithPreload(() => import("./pages/FeatureInsights"));
const FeatureDadosEstruturados = lazyWithPreload(() => import("./pages/FeatureDadosEstruturados"));
const FeatureGestaoCampanhas = lazyWithPreload(() => import("./pages/FeatureGestaCampanhas"));
const FeatureGestaoBudget = lazyWithPreload(() => import("./pages/FeatureGestaoBudget"));
const FeatureSeoMonitoring = lazyWithPreload(() => import("./pages/FeatureSeoMonitoring"));
const AppStore = lazyWithPreload(() => import("./pages/AppStore"));
const AdminLogin = lazyWithPreload(() => import("./pages/AdminLogin"));
const AdminPanel = lazyWithPreload(() => import("./pages/AdminPanel"));
const StatusRssFallback = lazyWithPreload(() => import("./pages/StatusRssFallback"));
const TiaPage = lazyWithPreload(() => import("./pages/Tia"));
const Changelog = lazyWithPreload(() => import("./pages/Changelog"));
const VerifyTest = lazyWithPreload(() => import("./pages/VerifyTest"));
const VerifySuccess = lazyWithPreload(() => import("./pages/VerifySuccess"));
const CreateMetaUser = lazyWithPreload(() => import("./pages/CreateMetaUser"));

const queryClient = new QueryClient();

const App = () => {
  // Preload critical routes on mount (after a short delay to prioritize initial render)
  useEffect(() => {
    const preloadRoutes = async () => {
      // Prioritize high-traffic/critical authenticated routes
      await Promise.all([
        Dashboard.preload(),
        Home.preload(),
        Projects.preload(),
        Insights.preload(),
        Operations.preload(),
        Reports.preload(),
      ]);
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadRoutes);
    } else {
      setTimeout(preloadRoutes, 2000);
    }
  }, []);

  return (
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
};

export default App;
