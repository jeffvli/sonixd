import { Request, Response } from 'express';
import { z } from 'zod';
import packageJson from '../package.json';
import { authService } from '../services';
import { getSuccessResponse, validateRequest } from '../utils';

const login = async (req: Request, res: Response) => {
  validateRequest(req, { body: z.object({ username: z.string() }) });

  const { username } = req.body;
  const { statusCode, data } = await authService.login({ username });

  return res.status(statusCode).json(getSuccessResponse({ data, statusCode }));
};

const register = async (req: Request, res: Response) => {
  validateRequest(req, {
    body: z.object({
      password: z.string().min(6).max(255),
      username: z.string().min(4).max(26),
    }),
  });

  const { username, password } = req.body;
  const { statusCode, data } = await authService.register({
    password,
    username,
  });

  return res.status(statusCode).json(getSuccessResponse({ data, statusCode }));
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
      data: {
        description: packageJson.description,
        name: packageJson.name,
        version: packageJson.version,
      },
      statusCode: 200,
    })
  );
};

export const authController = { login, logout, ping, register };
