import express, { Router } from 'express';

import { authenticateLocal } from '../middleware';
import { serversService } from '../services';
import { getSuccessResponse } from '../utils';

const albumsRouter: Router = express.Router();

albumsRouter.get('/', authenticateLocal, async (_req, res) => {
  const { statusCode, data } = await serversService.get();
  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

export default albumsRouter;
