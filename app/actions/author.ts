// app/actions/author.ts
"use server";

import { enhance } from "@zenstackhq/runtime";
import type { AuthUser } from "@/types/auth";
import { prisma } from "@/lib/prisma/prisma";
import { getAuthUser } from "@/lib/auth/utils";

// Get enhanced prisma client with Zenstack policies
async function getEnhancedPrisma(user: AuthUser) {
  return enhance(prisma, { user });
}

export async function getAuthors(organizationSlug: string) {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = await getEnhancedPrisma(user);
    const authors = await db.author.findMany({
      where: {
        organization: {
          slug: organizationSlug,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        organization: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    return authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
}

export async function addAuthor(formData: FormData, organizationSlug: string) {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = await getEnhancedPrisma(user);
    const author = await db.author.create({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        organization: {
          connect: {
            slug: organizationSlug
          },
        },
      },
    });

    return author;
  } catch (error) {
    console.error("Error adding author:", error);
    throw error;
  }
}

export async function updateAuthor(
  formData: FormData,
  organizationSlug: string
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = await getEnhancedPrisma(user);
    const author = await db.author.update({
      where: {
        id: formData.get("id") as string,
        organization: {
          slug: organizationSlug,
        },
      },
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
      },
    });

    return author;
  } catch (error) {
    console.error("Error updating author:", error);
    throw error;
  }
}

export async function deleteAuthor(authorId: string) {
  try {
    const user = await getAuthUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = await getEnhancedPrisma(user);
    await db.author.delete({
      where: {
        id: authorId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting author:", error);
    throw error;
  }
}
