import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminExecuteSQL } from '@/lib/adminDatabaseApi';
import { supabase } from '@/integrations/supabase/client';
import { getAdminSession } from '@/lib/adminAuth';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/lib/adminAuth', () => ({
  getAdminSession: vi.fn(),
}));

describe('adminDatabaseApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adminExecuteSQL should fail if not logged in', async () => {
    (getAdminSession as any).mockReturnValue(null);

    const result = await adminExecuteSQL('test.sql');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Admin not logged in');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('adminExecuteSQL should pass credentials if logged in', async () => {
    const mockSession = {
      token: 'mock-token',
      admin: { id: 'mock-admin-id' },
    };
    (getAdminSession as any).mockReturnValue(mockSession);
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { success: true, message: 'OK' },
      error: null,
    });

    const result = await adminExecuteSQL('test.sql');

    expect(result.success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('admin-execute-sql', {
      headers: { 'x-admin-token': 'mock-token' },
      body: { sqlPath: 'test.sql', admin_id: 'mock-admin-id' },
    });
  });
});
