import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorMiddleware.ts';
import authRoutes from './routes/auth';
import websiteRoutes from './routes/website';
import logger from './logger';
import { validateEnv } from './utils/validateEnv.ts';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));

app.use("/user", authRoutes);
app.use("/", websiteRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
