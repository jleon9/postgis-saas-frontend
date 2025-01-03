// app/api/auth/register/route.ts
import { enhance } from '@zenstackhq/runtime';
import { SignJWT } from 'jose';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      organizationName,
      organizationSlug,
      organizationDomain,
      email,
      password,
      name,
      roleName = "ADMIN" // Default role for first user
    } = body;

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          domain: organizationDomain,
        }
      });

      // Get or create role
      const role = await tx.role.upsert({
        where: { name: roleName },
        create: {
          name: roleName,
          description: `${roleName} role`
        },
        update: {}
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          roleId: role.id,
          organizationId: organization.id
        },
        include: {
          role: true,
          organization: true
        }
      });

      return { organization, user };
    });

    return Response.json({
      success: true,
      organization: result.organization,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organization: result.user.organization,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}