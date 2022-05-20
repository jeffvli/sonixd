import express, { Router } from 'express';

import { authenticateAdmin, authenticateLocal } from '../middleware';
import { serversService } from '../services';
import { getSuccessResponse } from '../utils';

const serversRouter: Router = express.Router();

serversRouter.get('/', authenticateLocal, async (_req, res) => {
  const { statusCode, data } = await serversService.get();
  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

serversRouter.post('/', authenticateAdmin, async (req, res) => {
  const { name, url, username, token, serverType } = req.body;

  const { statusCode, data } = await serversService.create({
    name,
    url,
    username,
    token,
    serverType,
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

serversRouter.patch('/:id', async (_req, res) => {
  return res.status(200).json({});
});

serversRouter.post('/:id/scan', authenticateAdmin, async (req, res) => {
  const { statusCode, data } = await serversService.scan({
    id: Number(req.params.id),
    userId: Number(req.auth.id),
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

export default serversRouter;
