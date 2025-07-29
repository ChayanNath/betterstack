import dotenv from "dotenv";
dotenv.config();

import { xReadTicks, xAckTick } from "redisclient/client";
import { prismaClient } from "store/client";
import type { WebSiteStatus } from "../../packages/store/generated/prisma";
import logger from "logger/client";

const REGION = process.env.REGION_NAME!;
const WORKER_ID = process.env.WORKER_ID!;
const BATCH_SIZE = 50;
const MAX_WAIT_TIME_MS = 2000;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type TickMessage = {
  id: string;
  message: {
    website_id?: string;
    region_id?: string;
    status?: string;
    response_time_ms?: number;
  };
};

async function runWorker() {
  logger.info(`Ticks worker starting in region=${REGION} as ${WORKER_ID}`);

  const buffer: TickMessage[] = [];
  let lastFlush = Date.now();

  while (true) {
    try {
      const messages = await xReadTicks(REGION, WORKER_ID);

      if (messages && messages.length > 0) {
        buffer.push(...messages);
        logger.info(`Buffered ${buffer.length} ticks`);
      }

      const now = Date.now();
      const shouldFlush =
        buffer.length >= BATCH_SIZE || now - lastFlush > MAX_WAIT_TIME_MS;

      if (shouldFlush && buffer.length > 0) {
        const validMessages = buffer.filter(({ message }) =>
          message.website_id &&
          message.region_id &&
          message.status &&
          message.response_time_ms !== undefined
        );

        const ticks = validMessages.map(({ message }) => ({
          website_id: message.website_id!,
          region_id: message.region_id!,
          status: message.status as WebSiteStatus,
          response_time_ms: Number(message.response_time_ms),
        }));

        await prismaClient.websiteTick.createMany({
          data: ticks,
          skipDuplicates: true,
        });

        await xAckTick(REGION, validMessages.map((m) => m.id));
        logger.info(`Flushed ${ticks.length} ticks to DB`);

        buffer.splice(0, buffer.length);
        lastFlush = now;
      }

      await sleep(200);
    } catch (err) {
      logger.error("Error in ticks worker loop:", err);
      await sleep(1000);
    }
  }
}

runWorker();
