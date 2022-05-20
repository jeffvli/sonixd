import express, { Router } from 'express';

import { usersController } from '../controllers';
import { authenticateLocal } from '../middleware';

const usersRouter: Router = express.Router();

usersRouter.get('/', authenticateLocal, usersController.getUsers);

usersRouter.get('/:id', authenticateLocal, usersController.getUser);

export default usersRouter;
