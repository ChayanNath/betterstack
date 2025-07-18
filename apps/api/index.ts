
import express from 'express';
import { prismaClient } from 'store/client';
import { AuthInput } from './types';
import jwt from "jsonwebtoken";
import authMiddleware from './middleware';
import cors from 'cors';

const app = express();


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
}));

app.post("/user/signup", async (req, res) => {
  const data = AuthInput.safeParse(req.body);

  if (!data.success) {
    res.status(403).send("");
    return;
  }
  try {
    const user = await prismaClient.user.create({
      data: {
        username: data.data.username,
        password: data.data.password,
      },
    });

    res.json({id: user.id})
  } catch (e) {
    res.status(403).json({ message: "Username already exists" });
  }
});

app.post("/user/signin", async (require, res) => {
  const data = AuthInput.safeParse(require.body);

  if (!data.success) {
    res.status(403).json({error: data.error});
    return;
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        username: data.data.username
      }
    });

    if (user?.password !== data.data.password) {
      res.status(401).json({message: "Invalid credentials"});
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({
      jwt: token
    })
  } catch (e) {
    res.status(500).json({message: "Internal server error"});
  }
});

app.post("/website", authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ message: "Url is required" });
      return;
    }
    const website = await prismaClient.website.create({
      data: {
        url,
        userId: req?.user?.id,
      },
    });
    res
      .status(201)
      .json({ ...website, message: "Website created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to connect to database" });
    return;
  }
});

app.get("/website/:id", authMiddleware,async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!id) {
      res.status(400).json({ message: "Id is required" });
      return;
    }
    const website = await prismaClient.website.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        ticks: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });
    if (!website) {
      res.status(404).json({ message: "Website not found" });
      return;
    }
    res.status(200).json({ 
      userId: website.userId,
      url: website.url,
      id: website.id,

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to connect to database" });
    return;
  }
});

app.get("/websites", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [websites, total] = await Promise.all([
      prismaClient.website.findMany({
        where: {
          userId,
        },
        include: {
          ticks: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
        },
        skip,
        take: limit,
      }),
      prismaClient.website.count({
        where: {
          userId,
        },
      }),
    ]);

    res.status(200).json({
      data: websites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch websites" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});