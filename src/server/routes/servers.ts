import express, { Router } from 'express';

const serversRouter: Router = express.Router();

serversRouter.post('/scan', async (_req, res) => {
  return res.status(200);
});

serversRouter.post('/', async (_req, res) => {
  return res.status(200).json({});
});

export default serversRouter;
