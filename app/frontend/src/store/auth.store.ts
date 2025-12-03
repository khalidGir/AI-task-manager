import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
  setAuth: (token: string, user: { id: string; email: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null })
    }),
    {
      name: 'auth-storage', // name of the item in storage (must be unique)
    }
  )
);