// Combines conditional class names and resolves Tailwind utility conflicts.

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

/** Combines class inputs while keeping the last conflicting Tailwind utility. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
