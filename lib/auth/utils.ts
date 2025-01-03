// lib/auth/utils.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { AuthUser } from '@/types/auth';
import { Organization, Role } from '@prisma/client';

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth_token')?.value?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify and decode the JWT token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // Return the user information from the token
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      organization: payload.organization as Organization,
      role: payload.role as Role,
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

// Types
export interface RequestUser {
  id: string;
  organization: Organization;
  role: Role;
}

// Helper function to get user for Zenstack policies
export function getRequestUser(user: AuthUser): RequestUser {
  return {
    id: user.id,
    organization: user.organization,
    role: user.role,
  };
}