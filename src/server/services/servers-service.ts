import { prisma } from '../lib';
import { subsonicScanner } from '../tasks';
import SubsonicApi from '../tasks/subsonic/subsonic-api';
import { apiError, apiSuccess } from '../utils';

const getOne = async (options: { id: number }) => {
  const { id } = options;
  const server = await prisma.server.findUnique({
    where: { id },
    include: { serverFolder: true },
  });

  if (!server) {
    throw apiError.notFound('');
  }

  return apiSuccess.ok({ data: server });
};

const getMany = async () => {
  const servers = await prisma.server.findMany({
    include: { serverFolder: true },
  });

  return apiSuccess.ok({ data: servers });
};

const create = async (options: {
  name: string;
  url: string;
  username: string;
  token: string;
  serverType: string;
}) => {
  const server = await prisma.server.create({
    data: options,
  });

  const musicFoldersRes = await SubsonicApi.getMusicFolders(server);
  const musicFoldersData = musicFoldersRes.map(
    (musicFolder: { id: number; name: string }) => {
      return {
        name: musicFolder.name,
        remoteId: String(musicFolder.id),
        serverId: server.id,
      };
    }
  );

  musicFoldersData.forEach(
    async (musicFolder: {
      name: string;
      remoteId: string;
      serverId: number;
    }) => {
      await prisma.serverFolder.upsert({
        where: {
          uniqueServerFolderId: {
            remoteId: musicFolder.remoteId,
            serverId: musicFolder.serverId,
          },
        },
        update: { name: musicFolder.name },
        create: musicFolder,
      });
    }
  );

  return apiSuccess.ok({ data: { ...server } });
};

const scan = async (options: { id: number; userId: number }) => {
  const { id, userId } = options;
  const server = await prisma.server.findUnique({
    where: { id },
    include: { serverFolder: true },
  });

  if (!server) {
    throw apiError.notFound('Server does not exist.');
  }

  subsonicScanner.fullScan(userId, server);

  return apiSuccess.ok({ data: {} });
};

export const serversService = {
  getOne,
  getMany,
  create,
  scan,
};
