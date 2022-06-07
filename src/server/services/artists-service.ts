import { Request } from 'express';
import { prisma } from '../lib';
import { OffsetPagination, User } from '../types/types';
import {
  ApiError,
  ApiSuccess,
  hasFolderAccess,
  splitNumberString,
} from '../utils';

const getOne = async (options: { id: number; user: User }) => {
  const { id, user } = options;

  const album = await prisma.artist.findUnique({
    include: { genres: true },
    where: { id },
  });

  if (!album) {
    throw ApiError.notFound('');
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
    where: { OR: serverFoldersFilter },
  });
  const artists = await prisma.artist.findMany({
    include: { genres: true },
    skip: startIndex,
    take: limit,
    where: { OR: serverFoldersFilter },
  });

  return ApiSuccess.ok({
    data: artists,
    paginationItems: {
      limit,
      startIndex,
      totalEntries,
      url: req.originalUrl,
    },
  });
};

export const artistsService = {
  getMany,
  getOne,
};
