import { Router } from 'express';

import albumArtistsRouter from './album-artists-route';
import authRouter from './auth-route';
import serversRouter from './servers-route';
import tasksRouter from './tasks-route';
import usersRouter from './users-route';

const routes = Router();

routes.use('/api/auth', authRouter);
routes.use('/api/servers', serversRouter);
routes.use('/api/tasks', tasksRouter);
routes.use('/api/users', usersRouter);
routes.use('/api/album-artists', albumArtistsRouter);

export default routes;
