import express, { type NextFunction, type Request, type Response } from 'express';
import { prismaClient } from 'store/client';
import authMiddleware from '../middleware/authMiddleware';
import logger from 'logger/client';

const router = express.Router();

router.post("/website", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ message: "URL is required" });
        return;
    }

    const website = await prismaClient.website.create({
      data: {
        url,
        userId: req.user?.id,
      },
    });
    logger.info("Website created: " + website.id);
    res.status(201).json({ website, message: "Website created successfully" });
  } catch (e: any) {
    logger.error("Website creation error: " + e.message);
    next(e);
  }
});

router.get("/website/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const website = await prismaClient.website.findUnique({
      where: {
        id: req.params.id,
        userId: req.user?.id,
      },
      include: {
        ticks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!website) {
        res.status(404).json({ message: "Website not found" });
        logger.error("Website not found: " + req.params.id);
        return;
    }

    res.json(website);
  } catch (e: any) {
    logger.error("Get website error: " + e.message);
    next(e);
  }
});

router.delete("/website/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const website = await prismaClient.website.delete({
      where: {
        id: req.params.id,
        userId: req.user?.id,
      },
    });

    if (!website) {
      res.status(404).json({ message: "Website not found" });
      logger.error("Website not found: " + req.params.id);
      return;
    }

    res.json({ message: "Website deleted successfully" });
  } catch (e: any) {
    logger.error("Delete website error: " + e.message);
    next(e);
  }
});

router.get("/websites", authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [websites, total] = await Promise.all([
      prismaClient.website.findMany({
        where: { userId },
        include: {
          ticks: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
        skip,
        take: limit,
      }),
      prismaClient.website.count({ where: { userId } }),
    ]);

    res.json({
      data: websites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    logger.error("List websites error: " + e.message);
    next(e);
  }
});

export default router;
