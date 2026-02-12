# Google Ads API — Design Documentation

> Documento para aprovação do Developer Token do Google Ads API

---

## Company Name

Intentia Strategy Hub (Intentia Tecnologia LTDA)

---

## Business Model

Intentia Strategy Hub is a B2B SaaS platform that helps companies evaluate their strategic readiness for digital marketing investments. The platform provides automated URL diagnostics (heuristic + AI), competitive benchmarking, channel-specific scores (Google, Meta, LinkedIn, TikTok), and strategic insights grouped by project.

Our platform is accessed at **https://www.intentia.com.br** and is used exclusively by our paying customers (B2B companies) to manage and analyze their own advertising accounts. We do not manage ads on behalf of third parties — each customer connects their own Google Ads account via OAuth 2.0 and views their own data within our platform.

**Key points:**
- We are a multi-tenant SaaS application — each customer sees only their own data
- Customers connect their own Google Ads accounts via standard OAuth 2.0 consent flow
- We do NOT create, modify, or delete ads — we only READ campaign data and metrics for reporting and analysis purposes
- All data is isolated per user via Row Level Security (RLS) in our PostgreSQL database

---

## Tool Access/Use

Our tool is used by **our SaaS customers** (marketing managers, business owners, and strategists at B2B companies) to:

1. **Connect their Google Ads account** via OAuth 2.0 — the user authorizes read-only access to their own account
2. **Sync campaign data** — on-demand synchronization pulls campaign names, status, and performance metrics (impressions, clicks, conversions, cost) from the last 30 days
3. **View performance dashboards** — campaign metrics are displayed in our Operations page with KPI cards, performance charts, and AI-powered analysis
4. **Compare planned vs actual performance** — tactical plans created in our platform are compared against real Google Ads metrics to identify gaps
5. **Receive automated performance alerts** — our system evaluates 11 rules against synced metrics to generate alerts (budget overspend, low CTR, high CPA, negative ROI, etc.)

**Who accesses the tool:**
- Only authenticated users of our SaaS platform (login via email/password through Supabase Auth)
- Each user can only see their own connected Google Ads account and synced data
- No external agencies or third parties have access to the tool or the data

**Data sharing:**
- We do NOT share Google Ads data with any third parties
- We do NOT export or send Google Ads data outside our platform
- AI analysis (optional) is performed using the customer's own API keys (Google Gemini or Anthropic Claude) — the raw Google Ads data stays within our database

---

## Tool Design

### Architecture Overview

Our platform uses the following architecture for Google Ads integration:

**1. OAuth Connection Flow:**
```
User clicks "Connect" → Supabase Edge Function (oauth-connect) generates OAuth URL
→ User redirects to Google consent screen → Authorizes read-only access
→ Google redirects to our Edge Function (oauth-callback) with authorization code
→ Edge Function exchanges code for tokens → Calls listAccessibleCustomers API
→ Retrieves Customer ID and account name → Stores tokens in database (ad_integrations table)
→ Redirects user back to our frontend
```

**2. Data Sync Flow:**
```
User clicks "Sync" → Frontend calls Edge Function (integration-sync)
→ Edge Function checks token expiry → Auto-refreshes if expired
→ Calls Google Ads API (searchStream) to fetch campaigns and metrics (last 30 days)
→ Stores metrics in campaign_metrics table with source='api'
→ Creates sync log entry in integration_sync_logs table
→ Returns summary to frontend (records fetched/created/failed)
```

**3. Data Storage:**
- All synced data is stored in our Supabase PostgreSQL database
- `campaign_metrics` table stores: impressions, clicks, conversions, cost, revenue, CTR, CPC, CPA, ROAS per campaign per period
- `integration_sync_logs` table stores: sync history with status, duration, record counts, and errors
- Row Level Security (RLS) ensures each user can only access their own data

**4. Data Display:**
- **Operations page** (`/operations`): Shows campaign list with status badges, budget pacing, and expandable metric sections
- **Campaign Performance Cards**: Aggregated KPIs (total impressions, clicks, conversions, cost, ROAS)
- **Campaign Metrics List**: Individual metric records by period with expand/edit/delete
- **AI Performance Analysis**: Optional AI-powered analysis using customer's own API key
- **Performance Alerts**: Automated alerts based on 11 evaluation rules (budget, efficiency, conversion, quality)
- **Tactical vs Real Comparison**: Gap analysis between planned targets and actual Google Ads metrics

**5. Token Management:**
- Access tokens are stored encrypted in the `ad_integrations` table
- Tokens are automatically refreshed when expired (Google access tokens expire after 1 hour)
- If refresh fails, the integration is marked as "expired" and the user must reconnect
- Tokens are isolated per user via RLS — no cross-tenant access is possible

---

## API Services Called

We use the following Google Ads API services (READ-ONLY):

1. **CustomerService — listAccessibleCustomers**
   - Called once during OAuth callback to discover the user's Google Ads Customer ID
   - Endpoint: `GET /v16/customers:listAccessibleCustomers`
   - Purpose: Retrieve the correct Customer ID to use for subsequent API calls

2. **CustomerService — get**
   - Called once during OAuth callback to get the account's descriptive name
   - Endpoint: `GET /v16/customers/{customerId}`
   - Purpose: Display a friendly account name in our UI

3. **GoogleAdsService — searchStream**
   - Called on-demand when user clicks "Sync" (not automated/scheduled)
   - Endpoint: `POST /v16/customers/{customerId}/googleAds:searchStream`
   - GAQL Query for campaigns:
     ```
     SELECT campaign.id, campaign.name, campaign.status,
            campaign.advertising_channel_type,
            metrics.impressions, metrics.clicks, metrics.conversions,
            metrics.cost_micros, metrics.conversions_value
     FROM campaign
     WHERE segments.date DURING LAST_30_DAYS
     ```
   - Purpose: Fetch campaign performance metrics for the last 30 days to display in our reporting dashboard

**Important notes:**
- We ONLY perform READ operations — no campaigns, ads, or settings are created, modified, or deleted
- Sync is triggered manually by the user (on-demand), not automated via cron or scheduled tasks
- All API calls include the required `developer-token` and `Authorization: Bearer` headers
- We respect rate limits and handle errors gracefully with retry logic

---

## Tool Mockups

### 1. Integrations Page — Connect Google Ads
The integrations page shows a card for each supported provider. Users click "Connect" to initiate the OAuth flow.

```
┌─────────────────────────────────────────────────────┐
│  Integrações                                        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Google Ads       │  │  Meta Ads         │        │
│  │  ● Connected      │  │  ○ Not connected  │        │
│  │  Account: 123-456 │  │                   │        │
│  │  Last sync: 2h ago│  │  [Connect]        │        │
│  │                   │  │                   │        │
│  │  [Sync] [Details] │  │                   │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  LinkedIn Ads     │  │  TikTok Ads       │        │
│  │  ○ Not connected  │  │  ○ Not connected  │        │
│  │  [Connect]        │  │  [Connect]        │        │
│  └──────────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### 2. Operations Page — Campaign Dashboard
After syncing, users see their campaigns with performance metrics.

```
┌─────────────────────────────────────────────────────┐
│  Operações — Campanhas                              │
│                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 45.2K   │ │ 1.8K    │ │ 127     │ │ R$3.2K  │  │
│  │Impressõe│ │ Cliques │ │Conversõe│ │ Custo   │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
│  Campaign: "Brand Search"          Google │ Active  │
│  Budget: R$5,000 ████████░░ 64% pacing             │
│  ▸ View Metrics                                     │
│                                                     │
│  Campaign: "Remarketing"           Google │ Active  │
│  Budget: R$2,000 ██████████ 92% pacing             │
│  ▸ View Metrics                                     │
│                                                     │
│  Campaign: "Competitors"           Google │ Paused  │
│  Budget: R$1,500 ████░░░░░░ 35% pacing             │
│  ▸ View Metrics                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Campaign Metrics Detail — Expanded View
Each campaign can be expanded to show detailed metrics per period.

```
┌─────────────────────────────────────────────────────┐
│  Campaign: "Brand Search" — Metrics                 │
│                                                     │
│  Period: Jan 1-31, 2025                             │
│  ┌────────────┬────────────┬────────────┬────────┐  │
│  │ Impressions│ Clicks     │ CTR        │ CPC    │  │
│  │ 22,450     │ 892        │ 3.97%      │ R$1.79 │  │
│  ├────────────┼────────────┼────────────┼────────┤  │
│  │ Conversions│ CPA        │ Cost       │ ROAS   │  │
│  │ 64         │ R$24.95    │ R$1,597    │ 4.2x   │  │
│  └────────────┴────────────┴────────────┴────────┘  │
│                                                     │
│  Period: Dec 1-31, 2024                             │
│  ┌────────────┬────────────┬────────────┬────────┐  │
│  │ Impressions│ Clicks     │ CTR        │ CPC    │  │
│  │ 19,800     │ 756        │ 3.82%      │ R$1.92 │  │
│  └────────────┴────────────┴────────────┴────────┘  │
└─────────────────────────────────────────────────────┘
```

### 4. Performance Alerts
Automated alerts based on synced Google Ads metrics.

```
┌─────────────────────────────────────────────────────┐
│  Alertas de Performance                             │
│                                                     │
│  🔴 CRITICAL — Budget Overspend                     │
│  Campaign "Remarketing" has spent 92% of budget     │
│  with 8 days remaining in the period.               │
│                                                     │
│  🟡 WARNING — Low CTR                               │
│  Campaign "Competitors" CTR (1.2%) is below         │
│  industry benchmark (2.5%) for Search campaigns.    │
│                                                     │
│  🔵 INFO — No Recent Metrics                        │
│  Campaign "Display Awareness" has no metrics         │
│  recorded in the last 14 days.                      │
└─────────────────────────────────────────────────────┘
```

---

## Additional Information

- **Platform URL:** https://www.intentia.com.br
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Frontend:** React + TypeScript + Vite
- **OAuth Callback URL:** https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/oauth-callback
- **Data Retention:** Synced metrics are stored indefinitely for the customer's use. Customers can delete their data at any time via account settings.
- **Privacy:** We comply with LGPD (Brazilian General Data Protection Law). Users can export or delete all their data.
- **Security:** All communications over HTTPS. Tokens stored with RLS isolation. No cross-tenant data access possible.
