import express, { type NextFunction, type Request, type Response } from 'express';
import { prismaClient } from 'store/client';
import { AuthInput } from '../types';
import jwt from 'jsonwebtoken';
import logger from 'logger/client';
import bcrypt from 'bcrypt';
import authMiddleware from '../middleware/authMiddleware';
import { ca } from 'zod/v4/locales';

const router = express.Router();
const SALT_ROUNDS = 10;

router.post("/signup", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data = AuthInput.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ error: data.error });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(data.data.password, SALT_ROUNDS);

    const user = await prismaClient.user.create({
      data: {
        username: data.data.username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ id: user.id, message: "Signup successful" });
  } catch (e: any) {
    logger.warn("Signup failed: " + e.message);
    res.status(409).json({ message: "Username already exists" });
  }
});

router.post("/signin", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data = AuthInput.safeParse(req.body);
  if (!data.success) {
    res.status(400).json({ error: data.error });
    return;
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: { username: data.data.username },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      logger.error("Invalid credentials, Username: " + data.data.username);
      return;
    }

    const isPasswordValid = await bcrypt.compare(data.data.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      logger.error("Invalid password for user: " + user.username);
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Signed in successfully" });
  } catch (e: any) {
    logger.error("Signin error: " + e.message);
    next(e);
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", authMiddleware, (_, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.status(200).json({ message: "Signed out successfully" });
    logger.info("User signed out");
  } catch (e: any) {
    logger.error("Logout error: " + e.message);
    next(e);
  }
});

export default router;
