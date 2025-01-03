'use server'

import { SignJWT } from "jose";
import { cookies } from 'next/headers'

// Constants for cookie names and expiration times
const ACCESS_TOKEN_COOKIE = 'kong_access_token'
const REFRESH_TOKEN_COOKIE = 'kong_refresh_token'
const ACCESS_TOKEN_EXPIRY = '1m'
const REFRESH_TOKEN_EXPIRY = '24h'

export async function getKongTokens(url?: string) {
  try {
    // First check if we have a valid access token
    const currentAccessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
    
    if (currentAccessToken) {
      try {
        // Verify the current access token
        // If it's valid, return the existing tokens
        await verifyToken(currentAccessToken, url)
        return {
          accessToken: currentAccessToken,
          refreshToken: (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value
        }
      } catch (error) {
        // Token is invalid or expired, continue to refresh/generate new tokens
        console.log("Access token invalid or expired, generating new tokens")
      }
    }

    // Check for refresh token
    const currentRefreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value
    
    if (currentRefreshToken) {
      try {
        // Verify the refresh token
        await verifyToken(currentRefreshToken, url)
        // If valid, generate new access token but keep the same refresh token
        const newAccessToken = await generateAccessToken(url)
        
        // Set the new access token in cookies
        ;(await
              // Set the new access token in cookies
              cookies()).set(ACCESS_TOKEN_COOKIE, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 // 15 minutes in seconds
        })

        return {
          accessToken: newAccessToken,
          refreshToken: currentRefreshToken
        }
      } catch (error) {
        // Refresh token is invalid, generate both new tokens
        console.log("Refresh token invalid, generating new tokens")
      }
    }

    // Generate new tokens if none exist or all are invalid
    const { accessToken, refreshToken } = await generateNewTokens(url)
    
    // Set cookies
    ;(await
          // Set cookies
          cookies()).set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 // 15 minutes in seconds
    })

    ;(await cookies()).set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours in seconds
    })

    return { accessToken, refreshToken }
  } catch (e) {
    console.error('Error in getKongTokens:', e)
    throw e
  }
}

async function generateAccessToken(url?: string) {
  const secret = new TextEncoder().encode(
    process.env.DGRAPH_JWT_SECRET ?? url
  )

  return await new SignJWT({
    iss: "jwt-user",
    kid: process.env.DGRAPH_JWT_KEY,
    sub: "jwt-user",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret)
}

async function generateNewTokens(url?: string) {
  const secret = new TextEncoder().encode(
    process.env.DGRAPH_JWT_SECRET ?? url
  )

  const accessToken = await generateAccessToken(url)

  const refreshToken = await new SignJWT({
    iss: "jwt-user",
    kid: process.env.DGRAPH_JWT_KEY ?? "jleon9_dgraph",
    sub: "jwt-user",
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret)

  return { accessToken, refreshToken }
}

async function verifyToken(token: string, url?: string) {
  const { jwtVerify } = await import('jose')
  const secret = new TextEncoder().encode(
    process.env.DGRAPH_JWT_SECRET ?? url
  )
  
  return await jwtVerify(token, secret)
}
