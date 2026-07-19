// Defines the ForgeKit wrappers for Radix avatar primitives.

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../lib/cn.js";

import type React from "react";

/** Renders a circular container for an avatar image or fallback. */
export function Avatar({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>): React.JSX.Element {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

/** Renders the image when the avatar source has loaded. */
export function AvatarImage({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>): React.JSX.Element {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props} />;
}

/** Renders fallback content while the avatar image is unavailable. */
export function AvatarFallback({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>): React.JSX.Element {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  );
}
