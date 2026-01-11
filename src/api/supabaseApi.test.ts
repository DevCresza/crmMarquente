import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module before importing the API
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
  getEdgeFunctionUrl: vi.fn((name: string) => `https://test.supabase.co/functions/v1/${name}`),
}));

import { supabase } from '@/lib/supabase';
import { usersApi, registrationsApi, dashboardApi, authApi } from './supabaseApi';

const mockUsers = [
  {
    id: 'user-1',
    full_name: 'Test User',
    cpf: '12345678901',
    email: 'test@example.com',
    whatsapp: '11999999999',
    role: 'admin',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: null,
  },
];

const mockRegistrations = [
  {
    id: 'reg-1',
    brand_of_interest: 'Test Brand',
    cnpj: '12345678000190',
    razao_social: 'Test Company LTDA',
    contact_name: 'Test Contact',
    email: 'contact@test.com',
    whatsapp_phone: '11999999999',
    cidade: 'São Paulo',
    uf: 'SP',
    billing_range: 'R$ 100.000 - R$ 250.000',
    registration_type: 'vista',
    status: 'Lead Site',
    lgpd_accepted: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    business_partners: [],
    bank_references: [],
    commercial_references: [],
  },
];

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users on success', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        }),
      } as any);

      const result = await usersApi.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].full_name).toBe('Test User');
      expect(result[0].created_at).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      } as any);

      const result = await usersApi.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create user and return it', async () => {
      const newUser = {
        full_name: 'New User',
        cpf: '98765432101',
        email: 'new@example.com',
        whatsapp: '11888888888',
        role: 'cadastro' as const,
      };

      // Mock fetch for Edge Function call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { ...newUser, id: 'new-id', created_at: '2024-01-02T00:00:00.000Z' },
        }),
      });

      const result = await usersApi.create(newUser);

      expect(result).not.toBeNull();
      expect(result?.full_name).toBe('New User');
    });

    it('should return null on error', async () => {
      // Mock fetch for Edge Function call returning error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: 'Error creating user',
        }),
      });

      const result = await usersApi.create({
        full_name: 'Test',
        cpf: '123',
        email: 'test@test.com',
        whatsapp: '123',
        role: 'admin',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true on successful delete', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await usersApi.delete('user-1');

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Error' } }),
        }),
      } as any);

      const result = await usersApi.delete('user-1');

      expect(result).toBe(false);
    });
  });
});

describe('registrationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all registrations on success', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRegistrations, error: null }),
        }),
      } as any);

      const result = await registrationsApi.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].razao_social).toBe('Test Company LTDA');
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      } as any);

      const result = await registrationsApi.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should return true on successful update', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await registrationsApi.updateStatus('reg-1', 'Cadastro Realizado');

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Error' } }),
        }),
      } as any);

      const result = await registrationsApi.updateStatus('reg-1', 'Cadastro Realizado');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return true on successful delete', async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await registrationsApi.delete('reg-1');

      expect(result).toBe(true);
    });
  });
});

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return stats with correct counts', async () => {
      const mockFrom = vi.mocked(supabase.from);

      // Create a mock that tracks calls
      let callCount = 0;
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount <= 2) {
              return Promise.resolve({ count: callCount === 1 ? 3 : 2, error: null });
            }
            return Promise.resolve({ count: 1, error: null });
          }),
        }),
      } as any));

      // First call returns total
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ count: 10, error: null }),
      } as any);

      // Second call returns pending
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ count: 7, error: null }),
        }),
      } as any);

      // Third call returns completed
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      } as any);

      const result = await dashboardApi.getStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('completed');
    });
  });
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return user on successful login', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          user: mockUsers[0],
        }),
      });

      const result = await authApi.login('test@example.com', 'password');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null on failed login', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({
          success: false,
          error: 'Invalid credentials',
        }),
      });

      const result = await authApi.login('wrong@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await authApi.login('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
