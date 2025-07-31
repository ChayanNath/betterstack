import { xReadGroup, xAckBulk, xAddTick } from "redisclient/client";
import axios from "axios";
import { prismaClient } from "store/client";
import dotenv from "dotenv";
import logger from "logger/client";

dotenv.config();

const REGION_NAME = process.env.REGION_NAME;
const WORKER_ID = process.env.WORKER_ID;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type RedisMessage = {
  id: string;
  message: {
    url: string;
    id: string;
  };
};

async function getRegionId(regionName: string): Promise<string> {
  const region = await prismaClient.region.findUnique({
    where: { name: regionName },
  });

  if (!region) {
    logger.error(`Region "${regionName}" not found in the database`);
    throw new Error(`Region "${regionName}" not found in the database`);
  }

  return region.id;
}

async function processWebsite(
  { id: redisMessageId, message }: RedisMessage,
  regionId: string
): Promise<string | null> {
  const url = message.url;
  const websiteId = message.id;

  if (!url || !websiteId) {
    logger.warn("Invalid message format:", message);
    return null;
  }

  const startTime = Date.now();

  try {
    await axios.get(url);
    const endTime = Date.now();

    await xAddTick({
      response_time_ms: endTime - startTime,
      status: "up",
      region_id: regionId,
      website_id: websiteId,
    });

    return redisMessageId;
  } catch (err) {
    const endTime = Date.now();

    await xAddTick({
      response_time_ms: endTime - startTime,
      status: "down",
      region_id: regionId,
      website_id: websiteId,
    });

    return redisMessageId;
  }
}

async function main() {
  if (!REGION_NAME) throw new Error("REGION_NAME is required");
  if (!WORKER_ID) throw new Error("WORKER_ID is required");

  const regionId = await getRegionId(REGION_NAME);

  logger.info(`Ping Worker started for region "${REGION_NAME}" with ID: ${WORKER_ID}`);

  while (true) {
    try {
      const response = await xReadGroup(regionId, WORKER_ID);

      if (!response || response.length === 0) {
        await sleep(500);
        continue;
      }

      const results = await Promise.allSettled(
        response.map((msg) =>
          processWebsite(
            {
              id: msg.id,
              message: {
                url: msg.message.url!,
                id: msg.message.id!,
              },
            },
            regionId
          )
        )
      );

      const ackIds = results
        .filter(
          (res): res is PromiseFulfilledResult<string | null> =>
            res.status === "fulfilled"
        )
        .map((res) => res.value)
        .filter((id): id is string => !!id);

      if (ackIds.length > 0) {
        await xAckBulk(regionId, ackIds);
        logger.info(`Acked ${ackIds.length} messages`);
      }
    } catch (err) {
      logger.error("Error in ping worker loop:", err);
      await sleep(1000);
    }
  }
}

main().catch((err) => {
  console.error("Ping Worker failed to start:", err);
});
