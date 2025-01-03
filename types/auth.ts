// lib/auth/authTypes.ts

import { Organization, Role, User } from "@prisma/client";

// types/auth.ts
export interface RefreshTokenPayload {
  id: string;
  hashedToken: string;
  userId: string;
  expires: Date;
  revoked: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  orgName: string;
  orgSlug: string;
  adminName: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  [key: string]: string;
}

// types/auth.ts
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type AuthUser = {
  [key: string]: unknown;
  id: string;
  email: string;
  name: string;
  organization: Organization;
  role: Role;
}

export interface RefreshTokenData {
  id: string;
  hashedToken: string;
  expires: string;
  revoked: boolean;
  member: {
    id: string;
    name: string;
    email: string;
    role: {
      name: string;
    };
    organization: {
      id: string;
      slug: string;
    };
  };
}
