
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = { id: (decoded as any).id, username : (decoded as any).username };
    next();
  });
};

export default authMiddleware;