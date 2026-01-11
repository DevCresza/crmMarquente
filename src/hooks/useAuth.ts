import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "@/store";
import { authApi } from "@/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, setLoading } =
    useAuthStore();
  const initialized = useRef(false);

  // Check for existing session on mount (only once)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const checkSession = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (currentUser) {
          login(currentUser);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [login, setLoading]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);

      try {
        const foundUser = await authApi.login(email, password);

        if (foundUser) {
          login(foundUser);
          return true;
        }

        setLoading(false);
        return false;
      } catch (error) {
        console.error("Sign in error:", error);
        setLoading(false);
        return false;
      }
    },
    [login, setLoading]
  );

  const signOut = useCallback(async () => {
    await authApi.logout();
    logout();
  }, [logout]);

  const isAdmin = user?.role === "admin";
  const canAccessCRM = user?.role === "admin" || user?.role === "cadastro";

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    canAccessCRM,
    signIn,
    signOut,
  };
}
