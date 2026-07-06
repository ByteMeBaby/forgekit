// Defines the placeholder home route for the web app.

import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "../components/home-page";

/**
 * Home route registration for the web app root path.
 */
export const Route = createFileRoute("/")({
  component: HomePage
});
