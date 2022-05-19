import { prisma } from '../lib';
import { subsonicScanner } from '../tasks';
import SubsonicApi from '../tasks/subsonic/subsonic-api';
import ApiError from '../utils/api-error';
import ApiSuccess from '../utils/api-success';

const get = async () => {
  const servers = await prisma.server.findMany({
    include: { serverFolder: true },
  });

  return ApiSuccess.ok({ data: servers });
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

  return ApiSuccess.ok({ data: { ...server } });
};

const scan = async (options: { id: number; userId: number }) => {
  const { id, userId } = options;
  const server = await prisma.server.findUnique({
    where: { id },
    include: { serverFolder: true },
  });

  if (!server) {
    throw ApiError.notFound('Server does not exist.');
  }

  subsonicScanner.fullScan(userId, server);

  return ApiSuccess.ok({ data: {} });
};

export const serversService = {
  get,
  create,
  scan,
};
