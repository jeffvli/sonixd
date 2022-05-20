import { prisma, exclude } from '../lib';
import { apiError, apiSuccess } from '../utils';

const getOne = async (options: { id: number }) => {
  const { id } = options;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      serverFolderPermissions: true,
    },
  });

  if (!user) {
    throw apiError.notFound('');
  }

  return apiSuccess.ok({ data: exclude(user, 'password') });
};

const getMany = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      enabled: true,
      isAdmin: true,
      serverFolderPermissions: true,
    },
  });

  return apiSuccess.ok({ data: users });
};

export const usersService = {
  getOne,
  getMany,
};
