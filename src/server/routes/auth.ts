import express, { Router } from 'express';
import passport from 'passport';

import { authService } from '../services';
import { getSuccessResponse } from '../utils';

const authRouter: Router = express.Router();

authRouter.post('/login', passport.authenticate('local'), async (req, res) => {
  const { username, password } = req.body;
  const { statusCode, data } = await authService.login({ username, password });

  res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const { statusCode, data } = await authService.register({
    username,
    password,
  });

  return res.status(statusCode).json(getSuccessResponse({ statusCode, data }));
});

export default authRouter;
