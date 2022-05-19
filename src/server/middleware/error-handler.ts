import { NextFunction, Request, Response } from 'express';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    response: 'Error',
    error: {
      message: JSON.parse(err.message) || err.message,
      path: req.path,
    },
  });

  next();
};

export default errorHandler;
