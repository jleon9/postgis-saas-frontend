"use client";

import { AuthUser } from "@/types/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => {
        console.log("Setting user state:", user);
        set({ user });
      },

      clearUser: () => {
        console.log("Clearing user state");
        set({ user: null });
      },
    }),
    {
      name: "user-storage",
    }
  )
);