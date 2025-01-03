// app/[orgSlug]/layout.tsx
import { enhance } from "@zenstackhq/runtime";
import { getAuthUser } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma/prisma";

async function getEnhancedPrisma() {
  const user = await getAuthUser();
  return enhance(prisma, { user });
}

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await getEnhancedPrisma();

  return <div>{children}</div>;
}
