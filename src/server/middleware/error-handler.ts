import { NextFunction, Request, Response } from 'express';

import { isJsonString } from '../utils';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = '';

  if (err.message) {
    message = isJsonString(err.message) ? JSON.parse(err.message) : err.message;
  }

  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    response: 'Error',
    error: {
      message,
      path: req.path,
    },
  });

  next();
};

export default errorHandler;
