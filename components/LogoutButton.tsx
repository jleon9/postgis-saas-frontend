// components/auth/LogoutButton.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";
import { logout } from "@/app/actions/auth/logout";
import Loading from "./loader/Loading";

export default function LogoutButton() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("User after logout: ", user);
  });

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout("151c7b7a-f322-4580-a956-d2ad4ad3d243");
      clearUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect on error since we've cleared the local auth state
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.id) {
    return <Loading />;
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
