import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: true }, (err, _user, info) => {
    if (err) {
      return next(err);
    }

    const u: any = req.user;

    if (!u) {
      return res.status(401).json({
        statusCode: 401,
        response: 'Error',
        error: {
          message: info?.message || 'Invalid authorization.',
          path: req.path,
        },
      });
    }

    if (!u.isAdmin) {
      return res.status(403).json({
        statusCode: 403,
        response: 'Error',
        error: {
          message: info?.message || 'Requires admin.',
          path: req.path,
        },
      });
    }

    req.auth = {
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      enabled: u.enabled,
      isAdmin: u.isAdmin,
    };

    return next();
  })(req, res, next);
};

export default authenticateAdmin;
