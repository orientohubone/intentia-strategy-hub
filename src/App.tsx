import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Cases from "./pages/Cases";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Projects from "./pages/Projects";
import Insights from "./pages/Insights";
import Audiences from "./pages/Audiences";
import Benchmark from "./pages/Benchmark";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import TacticalPlan from "./pages/TacticalPlan";
import Alerts from "./pages/Alerts";
import Checkout from "./pages/Checkout";
import Subscribe from "./pages/Subscribe";
import NotFound from "./pages/NotFound";
import BrandGuide from "./pages/BrandGuide";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ForceLightMode } from "@/components/ForceLightMode";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ForceLightMode><Index /></ForceLightMode>} />
          <Route path="/precos" element={<ForceLightMode><Pricing /></ForceLightMode>} />
          <Route path="/auth" element={<ForceLightMode><Auth /></ForceLightMode>} />
          <Route path="/assinar" element={<ForceLightMode><Subscribe /></ForceLightMode>} />
          <Route path="/sobre" element={<ForceLightMode><About /></ForceLightMode>} />
          <Route path="/cases" element={<ForceLightMode><Cases /></ForceLightMode>} />
          <Route path="/blog" element={<ForceLightMode><Blog /></ForceLightMode>} />
          <Route path="/contato" element={<ForceLightMode><Contact /></ForceLightMode>} />
          <Route path="/politica-de-privacidade" element={<ForceLightMode><PrivacyPolicy /></ForceLightMode>} />
          <Route path="/termos-de-servico" element={<ForceLightMode><TermsOfService /></ForceLightMode>} />
          <Route path="/politica-de-cookies" element={<ForceLightMode><CookiePolicy /></ForceLightMode>} />
          <Route path="/brand" element={<ForceLightMode><BrandGuide /></ForceLightMode>} />
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
            path="/help" 
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<ForceLightMode><NotFound /></ForceLightMode>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
