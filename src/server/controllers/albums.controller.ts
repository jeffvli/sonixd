import { Request, Response } from 'express';
import { z } from 'zod';
import { albumsService } from '../services';
import {
  getSuccessResponse,
  idValidation,
  paginationValidation,
  validateRequest,
} from '../utils';

const getAlbumById = async (req: Request, res: Response) => {
  validateRequest(req, {
    params: z.object({ ...idValidation }),
    query: z.object({ serverUrls: z.optional(z.string().min(1)) }),
  });

  const { id } = req.params;
  const { serverUrls } = req.query;
  const data = await albumsService.findById({
    id: Number(id),
    serverUrls: serverUrls && String(serverUrls),
    user: req.auth,
  });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

const getAlbums = async (req: Request, res: Response) => {
  validateRequest(req, {
    query: z.object({
      ...paginationValidation,
      serverFolderIds: z.optional(z.string().min(1)),
      serverUrls: z.optional(z.string().min(1)),
    }),
  });

  const { limit, page, serverFolderIds, serverUrls } = req.query;
  const data = await albumsService.findMany(req, {
    limit: Number(limit),
    page: Number(page),
    serverFolderIds: serverFolderIds && String(serverFolderIds),
    serverUrls: serverUrls && String(serverUrls),
    user: req.auth,
  });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

export const albumsController = {
  getAlbumById,
  getAlbums,
};
