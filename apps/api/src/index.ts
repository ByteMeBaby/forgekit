import { serve } from "@hono/node-server";

import { createApp } from "./app.js";

// Re-exported from version.ts, which threads the core->api dependency edge (see app.ts).
export { API_VERSION, getApiVersion } from "./version.js";

function allowedOriginsFromEnv(value: string | undefined): string[] {
  if (value === undefined || value.trim() === "") {
    return ["http://localhost:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 3001);
const app = createApp({
  allowedOrigins: allowedOriginsFromEnv(process.env.WEB_ORIGINS),
  nodeEnv
});

// Full env validation at boot is deferred until core re-exports the config schema and there is real env to validate. For now this entry reads PORT directly.
serve({
  fetch: app.fetch,
  port
});
