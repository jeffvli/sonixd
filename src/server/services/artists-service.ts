import { Request } from 'express';

import { prisma } from '../lib';
import { OffsetPagination, User } from '../types/types';
import { hasFolderAccess, splitNumberString } from '../utils';
import ApiError from '../utils/api-error';
import ApiSuccess from '../utils/api-success';

const getOne = async (options: { id: number; user: User }) => {
  const { id, user } = options;
  const album = await prisma.artist.findUnique({ where: { id } });

  if (!album) {
    throw ApiError.notFound('Album artist not found.');
  }

  if (!(await hasFolderAccess([album?.serverFolderId], user))) {
    throw ApiError.forbidden('');
  }

  return ApiSuccess.ok({ data: album });
};

const getMany = async (
  req: Request,
  options: { serverFolderIds: string; user: User } & OffsetPagination
) => {
  const { user, limit, page, serverFolderIds: rServerFolderIds } = options;
  const serverFolderIds = splitNumberString(rServerFolderIds);

  if (!(await hasFolderAccess(serverFolderIds, user))) {
    throw ApiError.forbidden('');
  }

  const serverFoldersFilter = serverFolderIds.map((serverFolderId: number) => {
    return {
      ServerFolder: {
        id: { equals: Number(serverFolderId) },
      },
    };
  });

  const startIndex = limit * page;
  const totalEntries = await prisma.artist.count({
    where: {
      OR: serverFoldersFilter,
    },
  });
  const albumArtists = await prisma.artist.findMany({
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

export const artistsService = {
  getOne,
  getMany,
};
