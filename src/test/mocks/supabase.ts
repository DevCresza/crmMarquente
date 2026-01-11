import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  })),
};

export const mockUsers = [
  {
    id: 'user-1',
    full_name: 'Test User',
    cpf: '12345678901',
    email: 'test@example.com',
    whatsapp: '11999999999',
    role: 'admin',
    created_at: '2024-01-01T00:00:00.000Z',
  },
];

export const mockRegistrations = [
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
  },
];

// Reset all mocks helper
export function resetSupabaseMocks() {
  vi.clearAllMocks();
}
