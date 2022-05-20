import { Request, Response } from 'express';
import { z } from 'zod';

import packageJson from '../package.json';
import { authService } from '../services';
import { getSuccessResponse, validateRequest } from '../utils';

const login = async (req: Request, res: Response) => {
  validateRequest(req, { body: z.object({ username: z.string() }) });

  const { username } = req.body;
  const { statusCode, data } = await authService.login({ username });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

const register = async (req: Request, res: Response) => {
  validateRequest(req, {
    body: z.object({
      username: z.string().min(4).max(26),
      password: z.string().min(6).max(255),
    }),
  });

  const { username, password } = req.body;
  const { statusCode, data } = await authService.register({
    username,
    password,
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
};

const logout = async (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });

  return res.sendStatus(204);
};

const ping = async (_req: Request, res: Response) => {
  return res.status(200).json(
    getSuccessResponse({
      statusCode: 200,
      data: {
        name: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
      },
    })
  );
};

export const authController = { login, register, logout, ping };
