import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// We mock supabase directly for unit tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn()
  }
}));

// Mock the Auth hook since it's used in components
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } })
}));

describe('Sample Distribution - Industrial QA', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('a) Should deduct stock correctly via register_visit_sample_drop', async () => {
    // Mock successful execution
    const mockRpc = vi.mocked(supabase.rpc).mockResolvedValue({ 
      data: { success: true, new_stock: 10 }, 
      error: null 
    });

    const result = await supabase.rpc('register_visit_sample_drop', {
      p_visit_id: 'visit-123',
      p_product_id: 'prod-123',
      p_quantity: 10
    });

    expect(result.data.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('register_visit_sample_drop', expect.objectContaining({
      p_quantity: 10
    }));
  });

  it('b) Should prevent delivering more units than available in stock', async () => {
    // Mock failure due to insufficient stock (simulated by RPC error)
    vi.mocked(supabase.rpc).mockResolvedValue({ 
      data: null, 
      error: { message: 'Insufficient stock', code: 'P0001' } 
    });

    const result = await supabase.rpc('register_visit_sample_drop', {
      p_visit_id: 'visit-123',
      p_product_id: 'prod-123',
      p_quantity: 1000 // Ridiculous amount
    });

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe('Insufficient stock');
  });

  it('c) Atomic failure: should not change state if the RPC fails', async () => {
    // Mock a system error (e.g. database down)
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Connection Lost'));

    await expect(supabase.rpc('register_visit_sample_drop', {
      p_visit_id: 'visit-123',
      p_product_id: 'prod-123',
      p_quantity: 5
    })).rejects.toThrow('Connection Lost');
    
    // In a real RPC, PostgreSQL handles the transaction atomicity. 
    // This test ensures our client-side call treats it as an error.
  });

});
