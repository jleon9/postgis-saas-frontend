// app/actions/auth/logout.ts
"use server";

import { RefreshTokenService } from "@/lib/auth/services/RefreshTokenService";
import { cookies } from "next/headers";

export async function logout(userId: string) {
  try {
    // Revoke all refresh tokens for the user
    await RefreshTokenService.revokeToken(userId);

    // Clear cookies
    const cookieStore = cookies();
    (await cookieStore).delete("auth_token");
    (await cookieStore).delete("refresh_token");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
