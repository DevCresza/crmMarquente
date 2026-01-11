import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { generateId } from "@/lib/utils";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  addUser: (user: Omit<User, "id" | "created_at">) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateRole: (id: string, role: UserRole) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  setUsers: (users) => set({ users }),
  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      users: [newUser, ...state.users],
    }));
    return newUser;
  },
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    })),
  updateRole: (id, role) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, role } : user
      ),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  getUserById: (id) => get().users.find((user) => user.id === id),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
