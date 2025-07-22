import { type Request, type Response, type NextFunction } from 'express';
import logger from 'logger/client';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(`[${req.method}] ${req.url} - ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
}
