import { Router } from 'express';

import authRouter from './auth';
import serversRouter from './servers';
import tasksRouter from './tasks';
import usersRouter from './users';

const routes = Router();

routes.use('/api/auth', authRouter);
routes.use('/api/servers', serversRouter);
routes.use('/api/tasks', tasksRouter);
routes.use('/api/users', usersRouter);

export default routes;
