import { prismaClient } from "../index";

async function main() {
  const regions = ['us-east', 'us-west', 'eu-central', 'ap-south'];

  for (const name of regions) {
    await prismaClient.region.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seeded regions.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prismaClient.$disconnect());
