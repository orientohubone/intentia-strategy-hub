import { render, waitFor, screen } from "@testing-library/react";
import Home from "../pages/Home";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

// Mock hooks
const mockUser = { id: "test-user-id", email: "test@example.com", user_metadata: { full_name: "Test User" } };

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false,
  })),
}));

vi.mock("@/hooks/useTenantData", () => ({
  useTenantData: vi.fn(() => ({
    projects: [],
    loading: false,
  })),
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => {
  const selectMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const orderMock = vi.fn().mockReturnThis();
  const limitMock = vi.fn().mockReturnThis();
  const singleMock = vi.fn().mockReturnThis();
  const maybeSingleMock = vi.fn().mockReturnThis();

  // Default promise resolution for the chain
  const thenMock = (resolve: any) => resolve({ data: [], count: 0, error: null });

  // Make the chain thenable
  const chain = {
    select: selectMock,
    eq: eqMock,
    order: orderMock,
    limit: limitMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
    then: thenMock,
  };

  // Ensure mocks return the chain
  selectMock.mockReturnValue(chain);
  eqMock.mockReturnValue(chain);
  orderMock.mockReturnValue(chain);
  limitMock.mockReturnValue(chain);
  singleMock.mockReturnValue(chain);
  maybeSingleMock.mockReturnValue(chain);

  return {
    supabase: {
      from: vi.fn(() => chain),
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "Function not found" } }), // Default to fail RPC
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
      }),
      removeChannel: vi.fn().mockResolvedValue('ok'),
      removeAllChannels: vi.fn(),
    },
  };
});

describe("Home Dashboard Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("makes parallel requests to fetch stats (Baseline)", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Olá, Test User")).toBeInTheDocument();
    });

    // Wait for stats to load
    await waitFor(() => {
        // We expect calls to 'from' for:
        // 1. audiences
        // 2. benchmarks
        // 3. insights
        // 4. user_api_keys
        // 5. notifications
        // Plus 2 for recent activity (projects, insights)
        // Total 7 calls to 'from' from Home component
        // Note: useTenantData is mocked, so it doesn't make calls.
        // Expect 14 calls due to double rendering in test environment (StrictMode or similar)
        expect(supabase.from).toHaveBeenCalledTimes(14);
    });

    // Verify specific tables were queried
    const calls = (supabase.from as any).mock.calls.map((call: any[]) => call[0]);
    expect(calls).toContain("audiences");
    expect(calls).toContain("benchmarks");
    expect(calls).toContain("insights");
    expect(calls).toContain("user_api_keys");
    expect(calls).toContain("notifications");
  });

  it("uses RPC call when available (Optimized)", async () => {
    // Mock RPC success
    (supabase.rpc as any).mockResolvedValue({
      data: {
        audiencesCount: 10,
        benchmarksCount: 5,
        totalInsightsCount: 3,
        hasAiKey: true,
        notificationsCount: 2
      },
      error: null
    });

    render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
        // We expect RPC to be called
        expect(supabase.rpc).toHaveBeenCalledWith('get_home_stats');
    });

    // Check that 'from' calls are significantly reduced
    // Without optimization: ~14 calls (7 per render * 2)
    // With optimization: ~4 calls (2 per render * 2) -> only projects and insights for recent activity
    const fromCalls = (supabase.from as any).mock.calls.length;
    expect(fromCalls).toBeLessThan(10);
  });
});
