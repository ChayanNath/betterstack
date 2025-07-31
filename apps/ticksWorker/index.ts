import dotenv from "dotenv";
dotenv.config();

import { xReadTicks, xAckTick } from "redisclient/client";
import { prismaClient } from "store/client";
import type { WebSiteStatus } from "../../packages/store/generated/prisma";
import logger from "logger/client";

const REGION = process.env.REGION_NAME!;
const WORKER_ID = process.env.WORKER_ID!;
const BATCH_SIZE = 50;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function runWorker() {
  logger.info(`Ticks worker starting in region=${REGION} as ${WORKER_ID}`);

  while (true) {
  try {
    const messages = await xReadTicks(REGION, WORKER_ID, BATCH_SIZE);

    if (!messages) {
      await sleep(200);
      continue;
    }

    const validMessages = messages.filter(({ message }) =>
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
  } catch (err) {
    logger.error("Error in ticks worker loop:", err);
    await sleep(1000);
  }
}
}

runWorker();
