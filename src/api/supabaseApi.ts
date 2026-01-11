import { supabase, getEdgeFunctionUrl } from '@/lib/supabase';
import type { User, B2BRegistration, B2BStatus } from '@/types';
import { STATUS_ORDER } from '@/types';

// Status categories derived from STATUS_ORDER
const PENDING_STATUSES: B2BStatus[] = STATUS_ORDER.slice(0, 7); // All except completed statuses
const COMPLETED_STATUSES: B2BStatus[] = ['Cadastro Realizado', 'Onboarding Realizado'];

// Auth API using Supabase Auth with fallback to database auth
export const authApi = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        // Auth successful, fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (profile) {
          return profile as User;
        }

        // Return basic user info from auth if profile not found
        return {
          id: authData.user.id,
          full_name: authData.user.email?.split('@')[0] || 'Usuário',
          cpf: '',
          email: authData.user.email || email,
          role: 'user',
          created_at: authData.user.created_at,
        };
      }

      // Fallback: Try direct database authentication
      console.log('Supabase Auth failed, trying database auth...');
      return await authApi.databaseLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to database auth on error
      return await authApi.databaseLogin(email, password);
    }
  },

  // Direct database authentication (fallback)
  async databaseLogin(email: string, password: string): Promise<User | null> {
    try {
      // Verify credentials against auth.users using RPC or direct query
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        console.error('Database auth error:', error?.message);
        return null;
      }

      // For development: verify password against auth.users
      const { data: authCheck } = await supabase.rpc('verify_user_password', {
        user_email: email,
        user_password: password
      });

      if (authCheck === true) {
        return user as User;
      }

      // If RPC doesn't exist, return user for development
      // In production, this should fail
      if (import.meta.env.DEV) {
        console.warn('DEV MODE: Skipping password verification');
        return user as User;
      }

      return null;
    } catch (error) {
      console.error('Database login error:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    return profile as User | null;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();
        callback(profile as User | null);
      } else {
        callback(null);
      }
    });
  },
};

// Users API
export const usersApi = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, cpf, email, whatsapp, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data as User[];
  },

  async create(user: Omit<User, 'id' | 'created_at'> & { password?: string }): Promise<User | null> {
    try {
      const response = await fetch(getEdgeFunctionUrl('users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          full_name: user.full_name,
          cpf: user.cpf,
          email: user.email,
          whatsapp: user.whatsapp,
          role: user.role,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Error creating user:', data.error);
        return null;
      }

      return data.data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    // Remove fields that shouldn't be updated directly
    const { password, created_at, ...updateData } = updates as Partial<User> & { password?: string };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, cpf, email, whatsapp, role, created_at')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data as User;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    return true;
  },
};

// Registrations API
export const registrationsApi = {
  async getAll(): Promise<B2BRegistration[]> {
    const { data, error } = await supabase
      .from('b2b_registrations')
      .select('*, business_partners(*), bank_references(*), commercial_references(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }

    return data as B2BRegistration[];
  },

  async create(registration: Omit<B2BRegistration, 'id' | 'created_at'>): Promise<B2BRegistration | null> {
    const { business_partners, bank_references, commercial_references, ...regData } = registration;

    const { data: newReg, error } = await supabase
      .from('b2b_registrations')
      .insert(regData)
      .select()
      .single();

    if (error) {
      console.error('Error creating registration:', error);
      return null;
    }

    // Processa integracao com Linx e Flodesk em background
    // Nao bloqueia o cadastro se a integracao falhar
    registrationsApi.processIntegration(newReg.id).catch(err => {
      console.warn('Integration processing failed (will retry):', err);
    });

    return newReg as B2BRegistration;
  },

  // Processa integracao com Linx Commerce e Flodesk
  async processIntegration(registrationId: string): Promise<{ clifor?: string; flodeskSynced?: boolean } | null> {
    try {
      const response = await fetch(getEdgeFunctionUrl('process-registration'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ registrationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Integration error:', data.error);
        return null;
      }

      return {
        clifor: data.clifor,
        flodeskSynced: data.flodeskSynced,
      };
    } catch (error) {
      console.error('Error processing integration:', error);
      return null;
    }
  },

  async updateStatus(id: string, status: B2BStatus): Promise<boolean> {
    const { error } = await supabase
      .from('b2b_registrations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('b2b_registrations').delete().eq('id', id);
    if (error) {
      console.error('Error deleting registration:', error);
      return false;
    }
    return true;
  },
};

// Dashboard Stats API
export const dashboardApi = {
  async getStats(): Promise<{ total: number; pending: number; completed: number }> {
    const { count: total } = await supabase
      .from('b2b_registrations')
      .select('*', { count: 'exact', head: true });

    const { count: pending } = await supabase
      .from('b2b_registrations')
      .select('*', { count: 'exact', head: true })
      .in('status', PENDING_STATUSES);

    const { count: completed } = await supabase
      .from('b2b_registrations')
      .select('*', { count: 'exact', head: true })
      .in('status', COMPLETED_STATUSES);

    return { total: total || 0, pending: pending || 0, completed: completed || 0 };
  },
};
