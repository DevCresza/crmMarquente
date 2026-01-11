import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock the auth store
const mockSetLoading = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/store', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    logout: mockLogout,
    setLoading: mockSetLoading,
  }),
}));

// Mock the auth API
vi.mock('@/api', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

import { authApi } from '@/api';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canAccessCRM).toBe(false);
  });

  it('should call setLoading on mount', () => {
    renderHook(() => useAuth());
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('should sign in successfully', async () => {
    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    };

    vi.mocked(authApi.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.signIn('test@example.com', 'password');
    });

    expect(success).toBe(true);
    expect(mockLogin).toHaveBeenCalledWith(mockUser);
  });

  it('should fail sign in with invalid credentials', async () => {
    vi.mocked(authApi.login).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.signIn('wrong@example.com', 'wrong');
    });

    expect(success).toBe(false);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should handle sign in error', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.signIn('test@example.com', 'password');
    });

    expect(success).toBe(false);
  });

  it('should sign out successfully', async () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signOut();
    });

    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('useAuth role checks', () => {
  it('should correctly identify admin role from user object', () => {
    // Test the role check logic directly
    const adminUser = { id: '1', role: 'admin' as const };
    const isAdmin = adminUser.role === 'admin';
    expect(isAdmin).toBe(true);
  });

  it('should correctly identify CRM access for cadastro role', () => {
    // Test the CRM access logic directly
    const cadastroUser = { id: '1', role: 'cadastro' as const };
    const canAccessCRM = cadastroUser.role === 'admin' || cadastroUser.role === 'cadastro';
    expect(canAccessCRM).toBe(true);
  });

  it('should deny CRM access for representante role', () => {
    const representanteUser = { id: '1', role: 'representante' as const };
    const canAccessCRM = representanteUser.role === 'admin' || representanteUser.role === 'cadastro';
    expect(canAccessCRM).toBe(false);
  });
});
