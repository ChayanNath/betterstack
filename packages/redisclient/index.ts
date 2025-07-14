import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.error("Redis client error", err));

await client.connect();

const STREAM_NAME = "betteruptime:website";

type WebsiteEvent = {
  url: string;
  id: string;
};

type StreamMessage = {
  id: string;
  message: { [key: string]: string };
};

type StreamEntry = {
  name: string;
  messages: StreamMessage[];
};

async function xAdd({ url, id }: WebsiteEvent) {
  if (!url || !id) {
    throw new Error("Invalid WebsiteEvent: Missing url or id");
  }

  await client.xAdd(STREAM_NAME, "*", {
    url,
    id,
  });
}

export async function xAddBulk(websites: WebsiteEvent[]) {
  const pipeline = client.multi();

  for (const site of websites) {
    if (!site?.url || !site?.id) {
      console.warn("Skipping invalid website event:", site);
      continue;
    }

    pipeline.xAdd("betteruptime:website", "*", {
      url: site.url,
      id: site.id,
    });
  }

  try {
    await pipeline.exec();
  } catch (error) {
    console.error("Failed to execute Redis bulk xAdd:", error);
  }
}

function isStreamEntryArray(value: any): value is StreamEntry[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'name' in value[0] &&
    'messages' in value[0] &&
    Array.isArray(value[0].messages)
  );
}

export async function xReadGroup(consumerGroup: string, workerId: string): Promise<StreamMessage[] | null> {
  const stream = await client.xReadGroup(
    consumerGroup,
    workerId,
    { key: STREAM_NAME, id: '>' },
    { COUNT: 5 }
  );

  if (!isStreamEntryArray(stream)) {
    console.log("Stream: [] (unexpected type)", stream);
    return null;
  }

  const entry = stream[0];
  if (!entry || !Array.isArray(entry.messages)) {
    console.log("Stream: [] (invalid entry)");
    return null;
  }

  console.log("Stream:", entry.messages);
  return entry.messages;
}

async function xAck(consumerGroup: string, eventId: string) {
  await client.xAck(STREAM_NAME,consumerGroup, eventId);
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
  const pipeline = client.multi();
  for (const eventId of eventIds) {
    pipeline.xAck(STREAM_NAME, consumerGroup, eventId);
  }
  await pipeline.exec();
}