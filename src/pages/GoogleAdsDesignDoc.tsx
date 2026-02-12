import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Globe, Shield, Database, Cloud, Key, RefreshCw, BarChart3, Bell, Users, Monitor, Lock, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

export default function GoogleAdsDesignDoc() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BackToHomeButton />

      {/* Print-friendly styles */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          .print-doc { padding: 0 !important; max-width: 100% !important; }
          .print-doc section { break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="print-doc max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Back + Print */}
        <div className="no-print flex items-center justify-between mb-8">
          <Link
            to="/brand"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Brand Guide
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Printer className="h-4 w-4" />
            Salvar como PDF
          </button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* DOCUMENT HEADER */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="text-center mb-12 pb-8 border-b-2 border-[#FF6B2B]">
          <span className="text-3xl font-extrabold tracking-tight text-[#151A23]">
            intentia<span className="text-[#FF6B2B]">.</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151A23] mt-4">
            Google Ads API — Design Documentation
          </h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Document for Google Ads API Developer Token Approval
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Version 1.0 — {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* TABLE OF CONTENTS */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="mb-12 p-6 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
          <h2 className="text-sm font-bold text-[#151A23] uppercase tracking-wider mb-4">Table of Contents</h2>
          <div className="space-y-2">
            {[
              { n: "1", title: "Company Name" },
              { n: "2", title: "Business Model" },
              { n: "3", title: "Tool Access / Use" },
              { n: "4", title: "Tool Design" },
              { n: "5", title: "API Services Called" },
              { n: "6", title: "Tool Mockups" },
              { n: "7", title: "Additional Information" },
            ].map((item) => (
              <a key={item.n} href={`#section-${item.n}`} className="flex items-center gap-3 text-sm text-[#6B7280] hover:text-[#FF6B2B] transition-colors">
                <span className="w-6 h-6 rounded-full bg-[#FF6B2B]/10 text-[#FF6B2B] text-xs font-bold flex items-center justify-center flex-shrink-0">{item.n}</span>
                {item.title}
              </a>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 1. COMPANY NAME */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-1" className="mb-12">
          <SectionHeader number="1" title="Company Name" />
          <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white">
            <p className="text-lg font-bold text-[#151A23]">Intentia Strategy Hub</p>
            <p className="text-sm text-[#6B7280] mt-1">Intentia Tecnologia LTDA</p>
            <p className="text-sm text-[#6B7280] mt-1">
              <Globe className="h-3.5 w-3.5 inline mr-1 text-[#FF6B2B]" />
              https://www.intentia.com.br
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 2. BUSINESS MODEL */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-2" className="mb-12">
          <SectionHeader number="2" title="Business Model" />
          <div className="space-y-4">
            <p className="text-sm text-[#374151] leading-relaxed">
              Intentia Strategy Hub is a <strong>B2B SaaS platform</strong> that helps companies evaluate their strategic readiness for digital marketing investments. The platform provides automated URL diagnostics (heuristic + AI), competitive benchmarking, channel-specific scores (Google, Meta, LinkedIn, TikTok), and strategic insights grouped by project.
            </p>
            <p className="text-sm text-[#374151] leading-relaxed">
              Our platform is accessed at <strong>https://www.intentia.com.br</strong> and is used exclusively by our paying customers (B2B companies) to manage and analyze their own advertising accounts. We do not manage ads on behalf of third parties — each customer connects their own Google Ads account via OAuth 2.0 and views their own data within our platform.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {[
                { icon: Users, text: "Multi-tenant SaaS — each customer sees only their own data", color: "text-blue-600" },
                { icon: Key, text: "Customers connect their own Google Ads accounts via OAuth 2.0", color: "text-green-600" },
                { icon: FileText, text: "We only READ campaign data — we do NOT create, modify, or delete ads", color: "text-amber-600" },
                { icon: Shield, text: "All data isolated per user via Row Level Security (RLS)", color: "text-red-600" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
                  <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0 mt-0.5`} />
                  <p className="text-xs text-[#374151] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 3. TOOL ACCESS / USE */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-3" className="mb-12">
          <SectionHeader number="3" title="Tool Access / Use" />
          <div className="space-y-6">
            <p className="text-sm text-[#374151] leading-relaxed">
              Our tool is used by <strong>our SaaS customers</strong> (marketing managers, business owners, and strategists at B2B companies) to:
            </p>

            <div className="space-y-3">
              {[
                { step: "1", title: "Connect their Google Ads account", desc: "via OAuth 2.0 — the user authorizes read-only access to their own account" },
                { step: "2", title: "Sync campaign data", desc: "on-demand synchronization pulls campaign names, status, and performance metrics (impressions, clicks, conversions, cost) from the last 30 days" },
                { step: "3", title: "View performance dashboards", desc: "campaign metrics displayed in our Operations page with KPI cards, performance charts, and AI-powered analysis" },
                { step: "4", title: "Compare planned vs actual performance", desc: "tactical plans created in our platform are compared against real Google Ads metrics to identify gaps" },
                { step: "5", title: "Receive automated performance alerts", desc: "our system evaluates 11 rules against synced metrics to generate alerts (budget overspend, low CTR, high CPA, negative ROI, etc.)" },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-lg border border-[#E5E7EB]">
                  <span className="w-7 h-7 rounded-full bg-[#FF6B2B] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#151A23]">{item.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-3">
              <p className="text-sm font-semibold text-[#151A23]">Who accesses the tool:</p>
              <ul className="space-y-1.5">
                {[
                  "Only authenticated users of our SaaS platform (login via email/password through Supabase Auth)",
                  "Each user can only see their own connected Google Ads account and synced data",
                  "No external agencies or third parties have access to the tool or the data",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#374151]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-red-50 border border-red-200 space-y-3">
              <p className="text-sm font-semibold text-red-800">Data sharing policy:</p>
              <ul className="space-y-1.5">
                {[
                  "We do NOT share Google Ads data with any third parties",
                  "We do NOT export or send Google Ads data outside our platform",
                  "AI analysis (optional) is performed using the customer's own API keys — raw Google Ads data stays within our database",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-red-700">
                    <Lock className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 4. TOOL DESIGN */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-4" className="mb-12">
          <SectionHeader number="4" title="Tool Design" />
          <div className="space-y-8">

            {/* 4.1 OAuth Flow */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#151A23]">4.1 — OAuth Connection Flow</h3>
              <div className="space-y-0">
                {[
                  { icon: Monitor, label: "User clicks \"Connect Google Ads\"", sub: "Integrations page → handleConnect()", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                  { icon: Cloud, label: "Edge Function: oauth-connect", sub: "Validates session, generates state (base64: user_id + provider + timestamp), returns OAuth URL", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
                  { icon: Globe, label: "User redirects to Google consent screen", sub: "Authorizes read-only access to their Google Ads account", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
                  { icon: Cloud, label: "Edge Function: oauth-callback", sub: "Receives code + state, validates 10min expiry, exchanges code for tokens", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                  { icon: Key, label: "Calls listAccessibleCustomers API", sub: "Retrieves real Google Ads Customer ID + descriptive name", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
                  { icon: Database, label: "Stores tokens + account info", sub: "Upserts ad_integrations table with access_token, refresh_token, account_id, account_name", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                  { icon: Monitor, label: "Redirects user back to frontend", sub: "OAuthCallback.tsx shows status, waits for session restore, redirects to /integracoes", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className={`h-4 w-4 ${step.color}`} />
                      </div>
                      {i < 6 && <div className="w-px h-6 bg-[#E5E7EB]" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-[#151A23]">{step.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.2 Sync Flow */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#151A23]">4.2 — Data Sync Flow</h3>
              <div className="space-y-0">
                {[
                  { icon: RefreshCw, label: "User clicks \"Sync\"", sub: "Frontend calls Edge Function: integration-sync with JWT + provider", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
                  { icon: Key, label: "Token validation", sub: "Checks token_expires_at — auto-refreshes via refresh_token if expired", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                  { icon: Globe, label: "Fetches campaigns via Google Ads API", sub: "searchStream with GAQL query — campaigns + metrics for LAST_30_DAYS", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
                  { icon: Database, label: "Stores metrics in database", sub: "campaign_metrics table with source='api' + integration_sync_logs with status/duration/counts", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                  { icon: CheckCircle2, label: "Returns result to frontend", sub: "Toast with record counts + reload integrations list", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className={`h-4 w-4 ${step.color}`} />
                      </div>
                      {i < 4 && <div className="w-px h-6 bg-[#E5E7EB]" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-[#151A23]">{step.label}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.3 Data Storage */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#151A23]">4.3 — Data Storage</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-emerald-600" />
                    <code className="text-xs font-mono font-semibold text-emerald-700">campaign_metrics</code>
                  </div>
                  <p className="text-xs text-[#6B7280]">Stores synced data: impressions, clicks, conversions, cost, revenue, CTR, CPC, CPA, ROAS per campaign per period</p>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-cyan-600" />
                    <code className="text-xs font-mono font-semibold text-cyan-700">integration_sync_logs</code>
                  </div>
                  <p className="text-xs text-[#6B7280]">Sync history: status, duration, records fetched/created/updated/failed, period, errors</p>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <code className="text-xs font-mono font-semibold text-blue-700">ad_integrations</code>
                  </div>
                  <p className="text-xs text-[#6B7280]">OAuth tokens (access + refresh), account_id, account_name, sync config, status, error tracking</p>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-700">Row Level Security</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">All tables have RLS enabled — each user can only access their own data via auth.uid() = user_id</p>
                </div>
              </div>
            </div>

            {/* 4.4 Data Display */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#151A23]">4.4 — Data Display</h3>
              <div className="space-y-2">
                {[
                  { page: "Operations page (/operations)", desc: "Campaign list with status badges, budget pacing, expandable metric sections" },
                  { page: "Campaign Performance Cards", desc: "Aggregated KPIs — total impressions, clicks, conversions, cost, ROAS" },
                  { page: "Campaign Metrics List", desc: "Individual metric records by period with expand/edit/delete" },
                  { page: "AI Performance Analysis", desc: "Optional AI-powered analysis using customer's own API key (Gemini/Claude)" },
                  { page: "Performance Alerts", desc: "Automated alerts based on 11 evaluation rules (budget, efficiency, conversion, quality)" },
                  { page: "Tactical vs Real Comparison", desc: "Gap analysis between planned targets and actual Google Ads metrics" },
                ].map((item) => (
                  <div key={item.page} className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E7EB]">
                    <Monitor className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#151A23]">{item.page}</p>
                      <p className="text-xs text-[#6B7280]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.5 Token Management */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#151A23]">4.5 — Token Management</h3>
              <div className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] space-y-2">
                {[
                  "Access tokens stored in the ad_integrations table, isolated per user via RLS",
                  "Tokens automatically refreshed when expired (Google access tokens expire after 1 hour)",
                  "If refresh fails, integration marked as \"expired\" — user must reconnect",
                  "No cross-tenant access possible — RLS enforces user_id isolation",
                  "State parameter (base64 JSON with user_id + provider + timestamp) expires in 10 minutes to prevent CSRF",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#374151] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 5. API SERVICES CALLED */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-5" className="mb-12">
          <SectionHeader number="5" title="API Services Called" />
          <div className="space-y-4">
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Important:</strong> We ONLY perform <strong>READ operations</strong> — no campaigns, ads, or settings are created, modified, or deleted. Sync is triggered manually by the user (on-demand), not automated via cron or scheduled tasks.
                </p>
              </div>
            </div>

            {[
              {
                name: "CustomerService — listAccessibleCustomers",
                when: "Called once during OAuth callback",
                endpoint: "GET /v16/customers:listAccessibleCustomers",
                purpose: "Retrieve the correct Customer ID to use for subsequent API calls",
                color: "border-blue-200",
              },
              {
                name: "CustomerService — get",
                when: "Called once during OAuth callback",
                endpoint: "GET /v16/customers/{customerId}",
                purpose: "Display a friendly account name in our UI",
                color: "border-green-200",
              },
              {
                name: "GoogleAdsService — searchStream",
                when: "Called on-demand when user clicks \"Sync\" (not automated)",
                endpoint: "POST /v16/customers/{customerId}/googleAds:searchStream",
                purpose: "Fetch campaign performance metrics for the last 30 days to display in our reporting dashboard",
                color: "border-purple-200",
              },
            ].map((api) => (
              <div key={api.name} className={`p-5 rounded-xl border-2 ${api.color} bg-white space-y-3`}>
                <p className="text-sm font-bold text-[#151A23]">{api.name}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase font-semibold tracking-wider">When</p>
                    <p className="text-xs text-[#374151] mt-0.5">{api.when}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase font-semibold tracking-wider">Endpoint</p>
                    <code className="text-xs text-[#374151] font-mono mt-0.5 block">{api.endpoint}</code>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase font-semibold tracking-wider">Purpose</p>
                    <p className="text-xs text-[#374151] mt-0.5">{api.purpose}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* GAQL Query */}
            <div className="p-5 rounded-xl bg-[#1E1E2E] text-white space-y-3">
              <p className="text-xs font-semibold text-[#FF6B2B]">GAQL Query — searchStream</p>
              <pre className="text-xs font-mono leading-relaxed text-gray-300 overflow-x-auto whitespace-pre-wrap">{`SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.cost_micros,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS`}</pre>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
              <p className="text-xs text-[#374151] leading-relaxed">
                All API calls include the required <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB] font-mono">developer-token</code> and <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB] font-mono">Authorization: Bearer</code> headers. We respect rate limits and handle errors gracefully with retry logic.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 6. TOOL MOCKUPS */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-6" className="mb-12">
          <SectionHeader number="6" title="Tool Mockups" />
          <p className="text-xs text-[#6B7280] mb-6 italic">
            Note: These are representative mockups of our tool's interface. The actual UI may vary slightly.
          </p>
          <div className="space-y-8">

            {/* Mockup 1: Integrations */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#151A23]">6.1 — Integrations Page (Connect Google Ads)</p>
              <div className="rounded-xl border-2 border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono ml-2">intentia.com.br/integracoes</span>
                </div>
                <div className="p-6 bg-white">
                  <p className="text-lg font-bold text-[#151A23] mb-4">Integrações</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Google Ads", status: "Connected", account: "123-456-7890", lastSync: "2h ago", connected: true, color: "border-blue-300 bg-blue-50" },
                      { name: "Meta Ads", status: "Not connected", account: "", lastSync: "", connected: false, color: "border-gray-200 bg-white" },
                      { name: "LinkedIn Ads", status: "Not connected", account: "", lastSync: "", connected: false, color: "border-gray-200 bg-white" },
                      { name: "TikTok Ads", status: "Not connected", account: "", lastSync: "", connected: false, color: "border-gray-200 bg-white" },
                    ].map((p) => (
                      <div key={p.name} className={`p-4 rounded-xl border-2 ${p.color}`}>
                        <p className="text-sm font-bold text-[#151A23]">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-2 h-2 rounded-full ${p.connected ? "bg-green-500" : "bg-gray-300"}`} />
                          <span className="text-xs text-[#6B7280]">{p.status}</span>
                        </div>
                        {p.connected && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-[#6B7280]">Account: {p.account}</p>
                            <p className="text-xs text-[#6B7280]">Last sync: {p.lastSync}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-3 py-1 rounded-lg bg-[#FF6B2B] text-white text-xs font-medium">Sync</span>
                              <span className="px-3 py-1 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#374151]">Details</span>
                            </div>
                          </div>
                        )}
                        {!p.connected && (
                          <span className="inline-block mt-3 px-3 py-1 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#374151]">Connect</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Operations Dashboard */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#151A23]">6.2 — Operations Page (Campaign Dashboard)</p>
              <div className="rounded-xl border-2 border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono ml-2">intentia.com.br/operations</span>
                </div>
                <div className="p-6 bg-white space-y-4">
                  <p className="text-lg font-bold text-[#151A23]">Operações — Campanhas</p>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { value: "45.2K", label: "Impressões", color: "text-blue-600" },
                      { value: "1,847", label: "Cliques", color: "text-green-600" },
                      { value: "127", label: "Conversões", color: "text-purple-600" },
                      { value: "R$3,245", label: "Custo Total", color: "text-red-600" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="p-3 rounded-lg border border-[#E5E7EB] text-center">
                        <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                        <p className="text-[10px] text-[#6B7280]">{kpi.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Campaign rows */}
                  {[
                    { name: "Brand Search", status: "Active", pacing: 64, budget: "R$5,000" },
                    { name: "Remarketing", status: "Active", pacing: 92, budget: "R$2,000" },
                    { name: "Competitors", status: "Paused", pacing: 35, budget: "R$1,500" },
                  ].map((c) => (
                    <div key={c.name} className="p-3 rounded-lg border border-[#E5E7EB] flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#151A23]">{c.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Google</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-[#6B7280]">Budget: {c.budget}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[120px]">
                            <div className={`h-full rounded-full ${c.pacing > 90 ? "bg-red-500" : c.pacing > 70 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${c.pacing}%` }} />
                          </div>
                          <span className="text-[10px] text-[#6B7280]">{c.pacing}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#FF6B2B] font-medium">▸ View Metrics</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mockup 3: Metrics Detail */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#151A23]">6.3 — Campaign Metrics Detail</p>
              <div className="rounded-xl border-2 border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB]">
                  <span className="text-xs font-semibold text-[#151A23]">Campaign: "Brand Search" — Metrics</span>
                </div>
                <div className="p-6 bg-white">
                  <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB]">
                      <span className="text-xs text-[#6B7280]">Period: Jan 1–31, 2025</span>
                    </div>
                    <div className="grid grid-cols-4 divide-x divide-[#E5E7EB]">
                      {[
                        { label: "Impressions", value: "22,450" },
                        { label: "Clicks", value: "892" },
                        { label: "CTR", value: "3.97%" },
                        { label: "CPC", value: "R$1.79" },
                      ].map((m) => (
                        <div key={m.label} className="p-3 text-center">
                          <p className="text-xs text-[#6B7280]">{m.label}</p>
                          <p className="text-sm font-bold text-[#151A23] mt-0.5">{m.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 divide-x divide-[#E5E7EB] border-t border-[#E5E7EB]">
                      {[
                        { label: "Conversions", value: "64" },
                        { label: "CPA", value: "R$24.95" },
                        { label: "Cost", value: "R$1,597" },
                        { label: "ROAS", value: "4.2x" },
                      ].map((m) => (
                        <div key={m.label} className="p-3 text-center">
                          <p className="text-xs text-[#6B7280]">{m.label}</p>
                          <p className="text-sm font-bold text-[#151A23] mt-0.5">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 4: Performance Alerts */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#151A23]">6.4 — Performance Alerts</p>
              <div className="rounded-xl border-2 border-[#E5E7EB] overflow-hidden">
                <div className="bg-[#F9FAFB] px-4 py-2 border-b border-[#E5E7EB]">
                  <span className="text-xs font-semibold text-[#151A23]">Alertas de Performance</span>
                </div>
                <div className="p-6 bg-white space-y-3">
                  {[
                    { severity: "CRITICAL", color: "border-red-300 bg-red-50", badge: "bg-red-100 text-red-700", title: "Budget Overspend", desc: "Campaign \"Remarketing\" has spent 92% of budget with 8 days remaining." },
                    { severity: "WARNING", color: "border-amber-300 bg-amber-50", badge: "bg-amber-100 text-amber-700", title: "Low CTR", desc: "Campaign \"Competitors\" CTR (1.2%) is below industry benchmark (2.5%)." },
                    { severity: "INFO", color: "border-blue-300 bg-blue-50", badge: "bg-blue-100 text-blue-700", title: "No Recent Metrics", desc: "Campaign \"Display Awareness\" has no metrics recorded in the last 14 days." },
                  ].map((alert) => (
                    <div key={alert.title} className={`p-4 rounded-lg border ${alert.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${alert.badge}`}>{alert.severity}</span>
                        <p className="text-sm font-semibold text-[#151A23]">{alert.title}</p>
                      </div>
                      <p className="text-xs text-[#6B7280]">{alert.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* 7. ADDITIONAL INFORMATION */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="section-7" className="mb-12">
          <SectionHeader number="7" title="Additional Information" />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Platform URL", value: "https://www.intentia.com.br" },
                { label: "Backend", value: "Supabase (PostgreSQL + Edge Functions + Auth)" },
                { label: "Frontend", value: "React + TypeScript + Vite" },
                { label: "OAuth Callback URL", value: "https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/oauth-callback" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border border-[#E5E7EB]">
                  <p className="text-[10px] text-[#6B7280] uppercase font-semibold tracking-wider">{item.label}</p>
                  <p className="text-xs text-[#374151] font-mono mt-1 break-all">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Database, title: "Data Retention", desc: "Synced metrics stored indefinitely for customer use. Customers can delete all data at any time via account settings.", color: "text-emerald-600" },
                { icon: Shield, title: "Privacy (LGPD)", desc: "We comply with LGPD (Brazilian General Data Protection Law). Users can export or delete all their data.", color: "text-blue-600" },
                { icon: Lock, title: "Security", desc: "All communications over HTTPS. Tokens stored with RLS isolation. No cross-tenant data access possible.", color: "text-red-600" },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <p className="text-xs font-semibold text-[#151A23]">{item.title}</p>
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="pt-8 border-t-2 border-[#FF6B2B] text-center">
          <span className="text-xl font-extrabold tracking-tight text-[#151A23]">
            intentia<span className="text-[#FF6B2B]">.</span>
          </span>
          <p className="text-xs text-[#6B7280] mt-2">
            Google Ads API Design Documentation — Intentia Strategy Hub
          </p>
          <p className="text-xs text-[#6B7280]">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-8 h-8 rounded-full bg-[#FF6B2B] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{number}</span>
      <h2 className="text-xl font-bold text-[#151A23] tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-[#E5E7EB]" />
    </div>
  );
}
