import { prisma } from '../lib';
import {
  jellyfinApi,
  jellyfinTasks,
  subsonicApi,
  subsonicTasks,
} from '../queue';
import { apiError, apiSuccess, splitNumberString } from '../utils';

const getOne = async (options: { id: number }) => {
  const { id } = options;
  const server = await prisma.server.findUnique({
    include: { serverFolder: true },
    where: { id },
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
  remoteUserId: string;
  serverType: string;
  token: string;
  url: string;
  username: string;
}) => {
  const server = await prisma.server.create({ data: options });

  let musicFoldersData: {
    name: string;
    remoteId: string;
    serverId: number;
  }[] = [];

  if (options.serverType === 'subsonic') {
    const musicFoldersRes = await subsonicApi.getMusicFolders(server);
    musicFoldersData = musicFoldersRes.map((musicFolder) => {
      return {
        name: musicFolder.name,
        remoteId: String(musicFolder.id),
        serverId: server.id,
      };
    });
  }

  if (options.serverType === 'jellyfin') {
    const musicFoldersRes = await jellyfinApi.getMusicFolders(server);
    musicFoldersData = musicFoldersRes.map((musicFolder) => {
      return {
        name: musicFolder.Name,
        remoteId: String(musicFolder.Id),
        serverId: server.id,
      };
    });
  }

  musicFoldersData.forEach(async (musicFolder) => {
    await prisma.serverFolder.upsert({
      create: musicFolder,
      update: { name: musicFolder.name },
      where: {
        uniqueServerFolderId: {
          remoteId: musicFolder.remoteId,
          serverId: musicFolder.serverId,
        },
      },
    });
  });

  return apiSuccess.ok({ data: { ...server } });
};

const refresh = async (options: { id: number }) => {
  const { id } = options;
  const server = await prisma.server.findUnique({ where: { id } });

  if (!server) {
    throw apiError.notFound('');
  }

  let musicFoldersData: {
    name: string;
    remoteId: string;
    serverId: number;
  }[] = [];

  if (server.serverType === 'subsonic') {
    const musicFoldersRes = await subsonicApi.getMusicFolders(server);
    musicFoldersData = musicFoldersRes.map((musicFolder) => {
      return {
        name: musicFolder.name,
        remoteId: String(musicFolder.id),
        serverId: server.id,
      };
    });
  }

  if (server.serverType === 'jellyfin') {
    const musicFoldersRes = await jellyfinApi.getMusicFolders(server);
    musicFoldersData = musicFoldersRes.map((musicFolder) => {
      return {
        name: musicFolder.Name,
        remoteId: String(musicFolder.Id),
        serverId: server.id,
      };
    });
  }

  musicFoldersData.forEach(async (musicFolder) => {
    await prisma.serverFolder.upsert({
      create: musicFolder,
      update: { name: musicFolder.name },
      where: {
        uniqueServerFolderId: {
          remoteId: musicFolder.remoteId,
          serverId: musicFolder.serverId,
        },
      },
    });
  });

  return apiSuccess.ok({ data: { ...server } });
};

const fullScan = async (options: {
  id: number;
  serverFolderIds?: string;
  userId: number;
}) => {
  const { id, serverFolderIds } = options;
  const server = await prisma.server.findUnique({
    include: { serverFolder: true },
    where: { id },
  });

  if (!server) {
    throw apiError.notFound('Server does not exist.');
  }

  let serverFolders;
  if (serverFolderIds) {
    const selectedServerFolderIds = splitNumberString(serverFolderIds);
    serverFolders = server.serverFolder.filter((folder) =>
      selectedServerFolderIds?.includes(folder.id)
    );
  } else {
    serverFolders = server.serverFolder;
  }

  if (server.serverType === 'jellyfin') {
    for (const serverFolder of serverFolders) {
      jellyfinTasks.scanAll(server, serverFolder);
    }
  }

  if (server.serverType === 'subsonic') {
    for (const serverFolder of serverFolders) {
      subsonicTasks.scanAll(server, serverFolder);
    }
  }

  return apiSuccess.ok({ data: {} });
};

export const serversService = {
  create,
  fullScan,
  getMany,
  getOne,
  refresh,
};
