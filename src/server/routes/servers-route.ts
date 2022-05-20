import express, { Router } from 'express';

import { serversController } from '../controllers';
import { authenticateAdmin, authenticateLocal } from '../middleware';

const serversRouter: Router = express.Router();

serversRouter.get('/', authenticateLocal, serversController.getServers);

serversRouter.get('/:id', authenticateLocal, serversController.getServer);

serversRouter.post('/', authenticateAdmin, serversController.createServer);

serversRouter.post(
  '/:id/scan',
  authenticateAdmin,
  serversController.scanServer
);

export default serversRouter;
