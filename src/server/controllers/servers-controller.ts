import { Request, Response } from 'express';
import { z } from 'zod';
import { serversService } from '../services';
import { getSuccessResponse, idValidation, validateRequest } from '../utils';

const getServer = async (req: Request, res: Response) => {
  validateRequest(req, { params: z.object({ ...idValidation }) });

  const { id } = req.params;
  const data = await serversService.getOne({
    id: Number(id),
  });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

const getServers = async (_req: Request, res: Response) => {
  const data = await serversService.getMany();

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

const createServer = async (req: Request, res: Response) => {
  const { name, url, username, remoteUserId, token, serverType } = req.body;

  const data = await serversService.create({
    name,
    remoteUserId,
    serverType,
    token,
    url,
    username,
  });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

const refreshServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await serversService.refresh({ id: Number(id) });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

const scanServer = async (req: Request, res: Response) => {
  validateRequest(req, {
    query: z.object({ serverFolderIds: z.string().optional() }),
  });

  const { id } = req.params;
  const { serverFolderIds } = req.query;

  const data = await serversService.fullScan({
    id: Number(id),
    serverFolderIds: serverFolderIds && String(serverFolderIds),
    userId: Number(req.auth.id),
  });

  return res.status(data.statusCode).json(getSuccessResponse(data));
};

export const serversController = {
  createServer,
  getServer,
  getServers,
  refreshServer,
  scanServer,
};
