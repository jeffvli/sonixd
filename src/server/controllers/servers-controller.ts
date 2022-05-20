import { Request, Response } from 'express';
import { z } from 'zod';

import { serversService } from '../services';
import { getSuccessResponse, idValidation, validateRequest } from '../utils';

const getServer = async (req: Request, res: Response) => {
  validateRequest(req, { params: z.object({ ...idValidation }) });

  const { id } = req.params;
  const { statusCode, data } = await serversService.getOne({
    id: Number(id),
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

const getServers = async (_req: Request, res: Response) => {
  const { statusCode, data } = await serversService.getMany();
  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

const createServer = async (req: Request, res: Response) => {
  const { name, url, username, token, serverType } = req.body;

  const { statusCode, data } = await serversService.create({
    name,
    url,
    username,
    token,
    serverType,
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

const scanServer = async (req: Request, res: Response) => {
  const { statusCode, data } = await serversService.scan({
    id: Number(req.params.id),
    userId: Number(req.auth.id),
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

export const serversController = {
  getServer,
  getServers,
  createServer,
  scanServer,
};
