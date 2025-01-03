// app/api/auth/login/route.ts
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma/prisma";
import { RefreshTokenService } from "@/lib/auth/services/UserTokenService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Get user with role and organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Revoke any existing refresh tokens
    await RefreshTokenService.revokeToken(user.id);

    // Create new refresh token
    const refreshToken = await RefreshTokenService.createToken(user.id);

    // Create auth user object
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
    };

    // Generate access token
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Create response
    const response = Response.json({
      success: true,
      user: authUser,
      accessToken,
      refreshToken,
    });

    // Set the cookies
    const cookieStore = cookies();
    (await cookieStore).set("auth_token", `Bearer ${accessToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    (await cookieStore).set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Login failed", details: error.message },
      { status: 500 }
    );
  }
}
