import { prisma } from '../lib';
import { User } from '../types/types';

const hasFolderAccess = async (serverFolderIds: any[], user: User) => {
  if (user.isAdmin) {
    return true;
  }

  const serverFoldersWithAccess = await prisma.serverFolder.findMany({
    where: {
      OR: [
        {
          isPublic: true,
        },
        {
          AND: [
            { isPublic: false },
            {
              serverFolderPermissions: {
                some: { userId: { equals: user.id } },
              },
            },
          ],
        },
      ],
    },
  });

  const serverFoldersWithAccessIds = serverFoldersWithAccess.map(
    (serverFolder) => serverFolder.id
  );

  const hasAccess = serverFolderIds.every((id) =>
    serverFoldersWithAccessIds.includes(id)
  );

  return hasAccess;
};

export default hasFolderAccess;
