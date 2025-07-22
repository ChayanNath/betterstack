import { prismaClient } from "store/client";
import { xAddBulk } from "redisclient/client";
import logger from  "logger/client";

async function main() {
  try {
    const websites = await prismaClient.website.findMany({
      select: {
        url: true,
        id: true,
      },
    });
    await xAddBulk(websites);
    logger.info("Websites added to Redis stream", websites);
  } catch (err) {
    logger.error("Error adding websites to Redis stream", err);
  }
}

setInterval(() => {
  main();
}, 3 * 1000 * 60);

main();