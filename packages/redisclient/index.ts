import { createClient, type RedisClientType } from "redis";

/**
 * CENTRAL CONFIG
 */
const STREAM_NAME = "betteruptime:website";

const TICK_STREAM_NAME = "betteruptime:tick";

export type TickEvent = {
  status: "up" | "down";
  response_time_ms: number;
  website_id: string;
  region_id: string;
};

let client: RedisClientType | null = null;
let isConnected = false;

async function connectIfNeeded() {
  if (isConnected && client) return;

  client = createClient();
  client.on("error", (err: any) => console.error("Redis client error", err));
  await client.connect();
  isConnected = true;
}

/**
 * Ensure the consumer group exists for the stream.
 * - MKSTREAM creates the stream if missing.
 * - Ignore BUSYGROUP (already exists).
 */
async function ensureGroup(consumerGroup: string) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  try {
    // "0" = read from beginning; use "$" to read only new entries from creation forward
    await client.xGroupCreate(STREAM_NAME, consumerGroup, "0", { MKSTREAM: true });
    // eslint-disable-next-line no-console
    console.log(`Created consumer group "${consumerGroup}" on stream "${STREAM_NAME}".`);
  } catch (err: any) {
    if (typeof err?.message === "string" && err.message.includes("BUSYGROUP")) {
      // group already exists — fine
      return;
    }
    throw err;
  }
}

/**
 * Shape of a site uptime event that we write to the stream.
 */
export type WebsiteEvent = {
  url: string;
  id: string; // website_id in DB
};

/**
 * Raw stream message returned by Redis client.
 */
export type StreamMessage = {
  id: string;
  message: Record<string, string>;
};

/**
 * Redis returns an array of { name, messages } objects when reading groups.
 */
type StreamEntry = {
  name: string;
  messages: StreamMessage[];
};

/**
 * Guard fn to check structure from xReadGroup.
 */
function isStreamEntryArray(value: unknown): value is StreamEntry[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "name" in value[0] &&
    "messages" in value[0] &&
    Array.isArray((value[0] as any).messages)
  );
}

/**
 * Add a single uptime event to the stream.
 */
export async function xAdd(event: WebsiteEvent) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  const { url, id } = event;
  if (!url || !id) throw new Error("Invalid WebsiteEvent: Missing url or id");

  await client.xAdd(STREAM_NAME, "*", { url, id });
}

/**
 * Bulk add multiple events in a pipeline.
 */
export async function xAddBulk(websites: WebsiteEvent[]) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  const pipeline = client.multi();
  for (const site of websites) {
    if (!site?.url || !site?.id) {
      console.warn("Skipping invalid website event:", site);
      continue;
    }
    pipeline.xAdd(STREAM_NAME, "*", { url: site.url, id: site.id });
  }

  try {
    await pipeline.exec();
  } catch (error) {
    console.error("Failed to execute Redis bulk xAdd:", error);
  }
}

/**
 * Read messages for this worker via consumer group.
 * Automatically ensures the group exists the first time.
 *
 * @param consumerGroup Region ID (or region name) — the group name
 * @param workerId Unique consumer name (WORKER_ID)
 * @returns Array of StreamMessage objects, or null if none
 */
export async function xReadGroup(
  consumerGroup: string,
  workerId: string
): Promise<StreamMessage[] | null> {
  await ensureGroup(consumerGroup); // creates stream & group if needed
  if (!client) throw new Error("Redis client not initialized");

  // '>' = new messages that were never delivered to any consumer
  const stream = await client.xReadGroup(
    consumerGroup,
    workerId,
    { key: STREAM_NAME, id: ">" },
    { COUNT: 5, BLOCK: 500 } // BLOCK optional; waits ms for new msgs
  );

  if (!isStreamEntryArray(stream)) {
    // no messages
    return null;
  }

  const entry = stream[0];
  if (!entry?.messages?.length) return null;

  return entry.messages;
}

/**
 * Ack a single message.
 */
export async function xAck(consumerGroup: string, eventId: string) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");
  await client.xAck(STREAM_NAME, consumerGroup, eventId);
}

/**
 * Ack multiple messages in a pipeline.
 */
export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
  if (!eventIds.length) return;
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  const pipeline = client.multi();
  for (const eventId of eventIds) {
    pipeline.xAck(STREAM_NAME, consumerGroup, eventId);
  }
  await pipeline.exec();
}


/**
 * Add a single uptime tick to the stream.
 *  
 * @param event 
 */
export async function xAddTick(event: TickEvent) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  const { status, response_time_ms, website_id, region_id } = event;
   await client.xAdd(TICK_STREAM_NAME, "*", {
    status,
    response_time_ms: response_time_ms.toString(),
    website_id,
    region_id,
  });
}

export async function xReadTicks(consumerGroup: string, workerId: string) {
  await ensureTickGroup(consumerGroup);
  if (!client) throw new Error("Redis client not initialized");

  const stream = await client.xReadGroup(
    consumerGroup,
    workerId,
    { key: TICK_STREAM_NAME, id: ">" },
    { COUNT: 100, BLOCK: 1000 }
  );

  if (!isStreamEntryArray(stream)) {
    return null;
  }

  const entry = stream[0];
  if (!entry?.messages?.length) return null;
  return entry.messages;
}

export async function xAckTick(consumerGroup: string, ids: string[]) {
  if (!ids.length) return;
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");
  const pipeline = client.multi();
  for (const id of ids) {
    pipeline.xAck(TICK_STREAM_NAME, consumerGroup, id);
  }
  await pipeline.exec();
}

async function ensureTickGroup(consumerGroup: string) {
  await connectIfNeeded();
  if (!client) throw new Error("Redis client not initialized");

  try {
    await client.xGroupCreate(TICK_STREAM_NAME, consumerGroup, "0", { MKSTREAM: true });
    console.log(`Created consumer group "${consumerGroup}" on stream "${TICK_STREAM_NAME}".`);
  } catch (err: any) {
    if (typeof err?.message === "string" && err.message.includes("BUSYGROUP")) {
      return;
    }
    throw err;
  }
}