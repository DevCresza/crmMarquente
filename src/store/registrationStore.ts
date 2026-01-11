import { create } from "zustand";
import type { B2BRegistration, B2BStatus } from "@/types";
import { generateId } from "@/lib/utils";

interface RegistrationState {
  registrations: B2BRegistration[];
  isLoading: boolean;
  error: string | null;
  setRegistrations: (registrations: B2BRegistration[]) => void;
  addRegistration: (registration: Omit<B2BRegistration, "id" | "created_at">) => B2BRegistration;
  updateRegistration: (id: string, updates: Partial<B2BRegistration>) => void;
  updateStatus: (id: string, status: B2BStatus) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationById: (id: string) => B2BRegistration | undefined;
  getRegistrationsByStatus: (status: B2BStatus) => B2BRegistration[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  isLoading: false,
  error: null,
  setRegistrations: (registrations) => set({ registrations }),
  addRegistration: (registrationData) => {
    const newRegistration: B2BRegistration = {
      ...registrationData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      registrations: [newRegistration, ...state.registrations],
    }));
    return newRegistration;
  },
  updateRegistration: (id, updates) =>
    set((state) => ({
      registrations: state.registrations.map((reg) =>
        reg.id === id
          ? { ...reg, ...updates, updated_at: new Date().toISOString() }
          : reg
      ),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      registrations: state.registrations.map((reg) =>
        reg.id === id
          ? { ...reg, status, updated_at: new Date().toISOString() }
          : reg
      ),
    })),
  deleteRegistration: (id) =>
    set((state) => ({
      registrations: state.registrations.filter((reg) => reg.id !== id),
    })),
  getRegistrationById: (id) => get().registrations.find((reg) => reg.id === id),
  getRegistrationsByStatus: (status) =>
    get().registrations.filter((reg) => reg.status === status),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
