import { Router } from 'express';

import albumArtistsRouter from './album-artists';
import authRouter from './auth';
import serversRouter from './servers';
import tasksRouter from './tasks';
import usersRouter from './users';

const routes = Router();

routes.use('/api/auth', authRouter);
routes.use('/api/servers', serversRouter);
routes.use('/api/tasks', tasksRouter);
routes.use('/api/users', usersRouter);
routes.use('/api/album-artists', albumArtistsRouter);

export default routes;
