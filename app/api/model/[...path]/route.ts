// app/api/model/[...path]/route.ts
import { enhance } from '@zenstackhq/runtime';
import { NextRequestHandler } from '@zenstackhq/server/next';
import { getAuthUser } from '@/lib/auth/utils';
import { prisma } from '@/lib/prisma/prisma';

const handler = NextRequestHandler({
  getPrisma: async (request) => {
    const user = await getAuthUser();
    return enhance(prisma, { user });
  },
  useAppDir: true
});

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };