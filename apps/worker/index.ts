import { xReadGroup, xAckBulk } from "redisclient/client";
import axios from "axios";
import { prismaClient } from "store/client";

const REGION_ID = process.env.REGION_ID;
const WORKER_ID = process.env.WORKER_ID;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type RedisMessage = {
  id: string;
  message: {
    url: string;
    id: string;
  };
};

// Handles a single website check
async function processWebsite({
  id: redisMessageId,
  message,
}: RedisMessage): Promise<string | null> {
  const url = message.url;
  const websiteId = message.id;

  if (!url || !websiteId) {
    console.warn("Invalid message format:", message);
    return null;
  }

  const startTime = Date.now();

  try {
    await axios.get(url);
    const endTime = Date.now();

    await prismaClient.websiteTick.create({
      data: {
        response_time_ms: endTime - startTime,
        status: "up",
        region_id: REGION_ID!,
        website_id: websiteId,
      },
    });

    return redisMessageId;
  } catch (err) {
    const endTime = Date.now();

    await prismaClient.websiteTick.create({
      data: {
        response_time_ms: endTime - startTime,
        status: "down",
        region_id: REGION_ID!,
        website_id: websiteId,
      },
    });

    return redisMessageId;
  }
}

async function main() {
  if (!REGION_ID) throw new Error("REGION_ID is required");
  if (!WORKER_ID) throw new Error("WORKER_ID is required");

  while (true) {
    try {
      const response = await xReadGroup(REGION_ID, WORKER_ID);

      if (!response || response.length === 0) {
        console.log("No response from Redis. Sleeping...");
        await sleep(500);
        continue;
      }

      const results = await Promise.allSettled(
        response
          .map(
            (msg) =>
              ({
                id: msg.id,
                message: {
                  url: msg.message.url,
                  id: msg.message.id,
                },
              }) as RedisMessage
          )
          .map((message) => processWebsite(message))
      );

      const ackIds = results
        .filter(
          (res): res is PromiseFulfilledResult<string | null> =>
            res.status === "fulfilled"
        )
        .map((res) => res.value)
        .filter((id): id is string => !!id);

      if (ackIds.length > 0) {
        await xAckBulk(REGION_ID, ackIds);
        console.log(`Acked ${ackIds.length} messages`);
      }
    } catch (err) {
      console.error("Error in worker loop:", err);
      await sleep(1000);
    }
  }
}

main();
