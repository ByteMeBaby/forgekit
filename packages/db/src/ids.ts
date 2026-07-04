import { uuidv7 as generate } from "uuidv7";

/**
 * Generates a UUIDv7: a time-ordered, B-tree-friendly identifier used as the text primary key on
 * every table. Time ordering keeps index inserts append-mostly and makes ids sort by creation time.
 */
export function uuidv7(): string {
  return generate();
}
