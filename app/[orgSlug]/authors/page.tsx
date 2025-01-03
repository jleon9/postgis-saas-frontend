import Authors from "@/components/feed/authors/Authors";
import LogoutButton from "@/components/LogoutButton";
import { useAuthStore } from "@/lib/auth/authStore";
import { useEffect } from "react";

export default function Home() {
  return (
    <main>
      <Authors />
      <LogoutButton />
    </main>
  );
}
