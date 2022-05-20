import express, { Router } from 'express';

import { albumArtistsController } from '../controllers';
import { authenticateLocal } from '../middleware';

const albumArtistsRouter: Router = express.Router();

albumArtistsRouter.get(
  '/',
  authenticateLocal,
  albumArtistsController.getAlbumArtists
);

albumArtistsRouter.get(
  '/:id',
  authenticateLocal,
  albumArtistsController.getAlbumArtist
);

export default albumArtistsRouter;
