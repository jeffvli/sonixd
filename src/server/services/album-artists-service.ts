import { Request } from 'express';

import { prisma } from '../lib';
import { AlbumArtistFilter } from '../types/types';
import { hasFolderAccess, splitNumberString } from '../utils';
import ApiError from '../utils/api-error';
import ApiSuccess from '../utils/api-success';

const getOne = async (options: { id: number }) => {
  const { id } = options;
  const album = await prisma.albumArtist.findUnique({ where: { id } });

  if (!album) {
    throw ApiError.notFound('Album artist not found.');
  }

  return ApiSuccess.ok({ data: album });
};

const getMany = async (req: Request, options: AlbumArtistFilter) => {
  const { user, limit, page, serverFolderIds: rServerFolderIds } = options;
  const serverFolderIds = splitNumberString(rServerFolderIds);

  if (!(await hasFolderAccess(serverFolderIds, user))) {
    throw ApiError.forbidden('Missing permission for selected server folders.');
  }

  const serverFoldersFilter = serverFolderIds.map((serverFolderId: number) => {
    return {
      ServerFolder: {
        id: { equals: Number(serverFolderId) },
      },
    };
  });

  const startIndex = limit * page;
  const totalEntries = await prisma.albumArtist.count();
  const albumArtists = await prisma.albumArtist.findMany({
    where: {
      OR: serverFoldersFilter,
    },
    skip: startIndex,
    take: limit,
  });

  return ApiSuccess.ok({
    data: albumArtists,
    paginationItems: {
      startIndex,
      totalEntries,
      limit,
      url: req.originalUrl,
    },
  });
};

export const albumArtistsService = {
  getOne,
  getMany,
};
