import { Request } from 'express';
import { prisma } from '../lib';
import { OffsetPagination, User } from '../types/types';
import {
  ApiError,
  ApiSuccess,
  folderPermissions,
  getFolderPermissions,
  splitNumberString,
} from '../utils';
import { toRes } from './response';

const findById = async (options: {
  id: number;
  serverUrls?: string;
  user: User;
}) => {
  const { id, user, serverUrls } = options;

  const album = await prisma.album.findUnique({
    include: {
      _count: true,
      albumArtist: true,
      genres: true,
      images: true,
      server: {
        include: {
          serverUrls: serverUrls
            ? { where: { id: { in: splitNumberString(serverUrls) } } }
            : true,
        },
      },
      serverFolders: true,
      songs: {
        include: {
          album: true,
          artists: true,
          externals: true,
          genres: true,
          images: true,
        },
        orderBy: [{ disc: 'asc' }, { track: 'asc' }],
      },
    },
    where: { id },
  });

  if (!album) {
    throw ApiError.notFound('');
  }

  const serverFolderIds = album.serverFolders.map(
    (serverFolder) => serverFolder.id
  );

  if (!(await folderPermissions(serverFolderIds, user))) {
    throw ApiError.forbidden('');
  }

  return ApiSuccess.ok({ data: toRes.albums([album], user)[0] });
};

const findMany = async (
  req: Request,
  options: {
    serverFolderIds?: string;
    serverUrls?: string;
    user: User;
  } & OffsetPagination
) => {
  const {
    user,
    limit,
    page,
    serverFolderIds: rServerFolderIds,
    serverUrls,
  } = options;

  const serverFolderIds = rServerFolderIds
    ? splitNumberString(rServerFolderIds)
    : await getFolderPermissions(user);

  if (!(await folderPermissions(serverFolderIds!, user))) {
    throw ApiError.forbidden('');
  }

  const serverFoldersFilter = serverFolderIds!.map((serverFolderId: number) => {
    return {
      serverFolders: {
        some: {
          id: { equals: Number(serverFolderId) },
        },
      },
    };
  });

  const startIndex = limit * page;
  const totalEntries = await prisma.album.count({
    where: {
      OR: [...serverFoldersFilter],
    },
  });

  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { favorites: true, songs: true } },
      albumArtist: true,
      genres: true,
      images: true,
      server: {
        include: {
          serverUrls: serverUrls
            ? { where: { id: { in: splitNumberString(serverUrls) } } }
            : true,
        },
      },
      songs: {
        include: {
          album: true,
          artists: true,
          externals: true,
          genres: true,
          images: true,
        },
        orderBy: [{ disc: 'asc' }, { track: 'asc' }],
      },
    },
    skip: startIndex,
    take: limit,
    where: { OR: serverFoldersFilter },
  });

  return ApiSuccess.ok({
    data: toRes.albums(albums, user),
    paginationItems: {
      limit,
      page,
      startIndex,
      totalEntries,
      url: req.originalUrl,
    },
  });
};

export const albumsService = {
  findById,
  findMany,
};
