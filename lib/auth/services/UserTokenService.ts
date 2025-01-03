// lib/auth/services/RefreshTokenService.ts
import { enhance } from "@zenstackhq/runtime";
import { v4 as uuidv4 } from "uuid";
import argon2 from "argon2";
import type { User, RefreshToken } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";

export class RefreshTokenService {
  // Creates or updates refresh token for user
  static async createToken(userId: string): Promise<string> {
    const token = uuidv4();
    const hashedToken = await argon2.hash(token);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Upsert the refresh token
    await prisma.refreshToken.upsert({
      where: {
        userId: userId,
      },
      create: {
        hashedToken,
        expires,
        userId,
        revoked: false,
      },
      update: {
        hashedToken,
        expires,
        revoked: false,
      },
    });

    return token;
  }

  // Verify and get token with user data
  static async verifyToken(token: string): Promise<RefreshToken | null> {
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        revoked: false,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            role: true,
            organization: true,
          },
        },
      },
    });

    if (!storedToken) return null;

    const isValid = await argon2.verify(storedToken.hashedToken, token);
    if (!isValid) return null;

    return storedToken;
  }

  // Revoke user's refresh token
  static async revokeToken(userId: string): Promise<void> {
    const existingRecord = await prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (!existingRecord) {
      return;
    }

    await prisma.refreshToken.delete({
      where: { userId },
    });
  }

  // Get valid refresh token for user
  static async getValidToken(userId: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        userId,
        revoked: false,
        expires: {
          gt: new Date(),
        },
      },
    });
  }
}
