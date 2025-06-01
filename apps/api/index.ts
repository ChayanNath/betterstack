
import express from 'express';
import { prismaClient } from 'store/client';
const app = express();


app.use(express.json());

app.post("/api/v1/website", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ message: "Url is required" });
      return;
    }
    const website = await prismaClient.website.create({
      data: {
        url,
      },
    });
    res
      .status(201)
      .json({ id: website.id, message: "Website created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to connect to database" });
    return;
  }
});

app.get("/api/v1/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const website = await prismaClient.website.findUnique({
      where: {
        id,
      },
      include: {
        ticks: true,
      },
    });
    if (!website) {
      res.status(404).json({ message: "Website not found" });
      return;
    }
    res.status(200).json({ website });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to connect to database" });
    return;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});