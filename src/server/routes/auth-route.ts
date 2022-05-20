import express, { Router } from 'express';
import passport from 'passport';

import { authController } from '../controllers';
import { authenticateLocal } from '../middleware';

const authRouter: Router = express.Router();

authRouter.post('/login', passport.authenticate('local'), authController.login);

authRouter.post('/register', authController.register);

authRouter.post('/logout', authenticateLocal, authController.logout);

authRouter.get('/ping', authController.ping);

export default authRouter;
