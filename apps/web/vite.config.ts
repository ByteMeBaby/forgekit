// Configures Vite and TanStack Start for the web app.

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite configuration for the ForgeKit web app.
 */
const config = defineConfig({
  plugins: [
    // Start injects the framework entries that the React plugin then compiles.
    tanstackStart(),
    viteReact()
  ]
});

export default config;
