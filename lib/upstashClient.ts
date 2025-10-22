import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let client: Redis | null = null;
if (url && token) {
  client = new Redis({ url, token });
}

export const isConfigured = !!client;

export async function redisSet(key: string, value: any) {
  if (!client) throw new Error("Upstash Redis is not configured");
  const toStore = typeof value === "string" ? value : JSON.stringify(value);
  return client.set(key, toStore);
}

export async function redisGet(key: string) {
  if (!client) throw new Error("Upstash Redis is not configured");
  return client.get(key);
}

export default {
  isConfigured,
  set: redisSet,
  get: redisGet,
};
