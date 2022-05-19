import express, { Router } from 'express';
import { z } from 'zod';

import { authenticateLocal, validateRequest } from '../middleware';
import { albumArtistsService } from '../services';
import {
  getSuccessResponse,
  paginationValidation,
  idValidation,
} from '../utils';

const albumArtistsRouter: Router = express.Router();

albumArtistsRouter.get(
  '/',
  authenticateLocal,
  validateRequest({
    query: z.object({
      ...paginationValidation,
      serverFolderIds: z.string().min(1),
    }),
  }),
  async (req, res) => {
    const { limit, page, serverFolderIds } = req.query;
    const data = await albumArtistsService.list({
      limit: Number(limit),
      page: Number(page),
      serverFolderIds: String(serverFolderIds),
      user: req.auth,
    });

    return res.status(data.statusCode).json(getSuccessResponse(data));
  }
);

albumArtistsRouter.get(
  '/:id',
  authenticateLocal,
  validateRequest({ params: z.object({ ...idValidation }) }),
  async (req, res) => {
    const { id } = req.params;
    const data = await albumArtistsService.get({ id: Number(id) });
    return res.status(data.statusCode).json(getSuccessResponse(data));
  }
);

export default albumArtistsRouter;
