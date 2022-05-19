import express, { Router } from 'express';
import passport from 'passport';
import { z } from 'zod';

import { authenticateLocal, validateRequest } from '../middleware';
import packageJson from '../package.json';
import { authService } from '../services';
import { getSuccessResponse } from '../utils';

const authRouter: Router = express.Router();

authRouter.post(
  '/login',
  passport.authenticate('local'),
  validateRequest({ body: z.object({ username: z.string() }) }),
  async (req, res) => {
    const { username } = req.body;
    const { statusCode, data } = await authService.login({ username });

    return res
      .status(statusCode)
      .json(getSuccessResponse({ statusCode, data }));
  }
);

authRouter.post(
  '/register',
  validateRequest({
    body: z.object({
      username: z.string().min(4).max(26),
      password: z.string().min(6).max(255),
    }),
  }),

  async (req, res) => {
    const { username, password } = req.body;
    const { statusCode, data } = await authService.register({
      username,
      password,
    });

    return res
      .status(statusCode)
      .json(getSuccessResponse({ statusCode, data }));
  }
);

authRouter.post('/logout', authenticateLocal, async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });

  return res.sendStatus(204);
});

authRouter.get('/ping', async (_req, res) => {
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
});

export default authRouter;
