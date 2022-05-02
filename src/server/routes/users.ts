import express, { Router } from 'express';

import orm from '../lib/prisma';

const usersRouter: Router = express.Router();

usersRouter.get('/', async (_req, res) => {
  const users = await orm.user.findMany();

  return res.status(200).json(users);
});

export default usersRouter;
