import { prismaClient } from "store/client";
import { xAddBulk } from "redisclient/client";

async function main() {
  const websites = await prismaClient.website.findMany({
    select: {
      url: true,
      id: true,
    },
  });
  await xAddBulk(websites);
}

setInterval(() => {
  main();
}, 3000);

main();