import express, { Router } from 'express';

import orm from '../lib/prisma';
import { authenticateLocal } from '../middleware';

const usersRouter: Router = express.Router();

usersRouter.get('/', authenticateLocal, async (_req, res) => {
  const users = await orm.user.findMany();

  return res.status(200).json(users);
});

export default usersRouter;
