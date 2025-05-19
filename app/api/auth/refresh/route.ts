// app/api/auth/refresh/route.ts
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { RefreshTokenService } from "@/lib/auth/services/RefreshTokenService";
import { prisma } from "@/lib/prisma/prisma";
import { PUBLIC_PATHS } from "@/middleware";

async function refreshTokens(request: Request) {
  console.log("🔄 [/api/auth/refresh] Starting refresh flow");
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore)
      .get("auth_token")
      ?.value?.replace("Bearer ", "");
    console.log("🔍 Access token present:", !!accessToken);

    if (!accessToken) {
      console.log("❌ No access token found");
      return Response.redirect(new URL("/login", request.url));
    }

    // Get user info from token (even if expired)
    let userId: string;
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      userId = payload.userId as string;
    } catch (error) {
      console.log("⚠️ Token expired, decoding payload");
      const decoded = JSON.parse(
        Buffer.from(accessToken.split(".")[1], "base64").toString()
      );
      userId = decoded.userId;
    }

    console.log("👤 Retrieved user ID:", userId);

    // Get valid refresh token
    const refreshToken = await RefreshTokenService.getValidToken(userId);

    if (!refreshToken) {
      console.log("❌ No valid refresh token found");
      return Response.redirect(new URL("/login", request.url));
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return Response.redirect(new URL("/login", request.url));
    }

    // Generate new access token
    const newAccessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationSlug: user.organization.slug
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Set new access token in cookie
    (
      await // Set new access token in cookie
      cookieStore
    ).set("auth_token", `Bearer ${newAccessToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    // Handle return URL
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get("returnTo");
    console.log("RETURN_TO: ", returnTo);

    const isValidUrl =
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !PUBLIC_PATHS.includes(returnTo);

    // Redirect to original URL or default route
    const redirectUrl = new URL(
      returnTo && isValidUrl ? returnTo : `/${user.organization.slug}/authors`,
      request.url
    );

    if (!user.organization.slug) {
      throw new Error(`User ${JSON.stringify(user)} has no organization slug`);
    }

    return Response.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Refresh error:", {
      message: error.message,
      stack: error.stack,
    });
    return Response.redirect(new URL("/login", request.url));
  }
}

export async function GET(request: Request) {
  return refreshTokens(request);
}

export async function POST(request: Request) {
  return refreshTokens(request);
}
