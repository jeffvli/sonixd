import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

export const authenticateLocal = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('local', { session: true }, (err, _user, info) => {
    if (err) {
      return next(err);
    }

    const u: any = req.user;

    if (!u) {
      return res.status(401).json({
        error: {
          message: info?.message || 'Invalid authorization.',
          path: req.path,
        },
        response: 'Error',
        statusCode: 401,
      });
    }

    if (!u.enabled) {
      return res.status(401).json({
        error: {
          message: 'Your account is not enabled.',
          path: req.path,
        },
        response: 'Error',
        statusCode: 401,
      });
    }

    req.auth = {
      createdAt: u?.createdAt,
      enabled: u?.enabled,
      id: u?.id,
      isAdmin: u?.isAdmin,
      updatedAt: u?.updatedAt,
      username: u?.username,
    };

    return next();
  })(req, res, next);
};
