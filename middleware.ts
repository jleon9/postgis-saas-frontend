// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
];

export async function middleware(request: NextRequest) {
  console.log("🔍 [Middleware] Processing request:", request.nextUrl.pathname);

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))) {
    console.log("✅ Public path, allowing through");
    return NextResponse.next();
  }

  try {
    // Get current access token
    const accessToken = request.cookies
      .get("auth_token")
      ?.value?.replace("Bearer ", "");
    console.log("🔍 Access token present:", !!accessToken);

    if (!accessToken) {
      console.log("❌ No access token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );

      // Check if token is about to expire (less than 1 minute remaining)
      const exp = payload.exp as number;
      const now = Math.floor(Date.now() / 1000);

      if (exp <= now) {
        // Token is expired, try refresh first
        console.log("🔄 Token expired, attempting refresh");
        const refreshUrl = new URL("/api/auth/refresh", request.url);
        refreshUrl.searchParams.set(
          "returnTo",
          request.nextUrl.pathname + request.nextUrl.search
        );
        return NextResponse.redirect(new URL("/api/auth/refresh", request.url));
      }

      if (exp - now < 30) {
        console.log("🔄 Token expiring soon, redirecting to refresh");
        const refreshUrl = new URL("/api/auth/refresh", request.url);
        // Add logging
        console.log("Current pathname:", request.nextUrl.pathname);
        console.log("Current search:", request.nextUrl.search);
        refreshUrl.searchParams.set(
          "returnTo",
          request.nextUrl.pathname + request.nextUrl.search
        );
        // Add logging
        console.log("Redirect URL:", refreshUrl.toString());
        return NextResponse.redirect(refreshUrl);
      }

      return NextResponse.next();
    } catch (error) {
      console.log("❌ Invalid token, redirecting to refresh");
      return NextResponse.redirect(new URL("/api/auth/refresh", request.url));
    }
  } catch (error) {
    console.error("❌ Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
