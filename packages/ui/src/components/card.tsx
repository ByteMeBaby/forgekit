// Defines composable layout primitives for card-shaped content.

import { cn } from "../lib/cn.js";

import type React from "react";

/** Renders a bordered card container. */
export function Card({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)}
      {...props}
    />
  );
}

/** Renders the heading region of a Card. */
export function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

/** Renders the primary heading inside a CardHeader. */
export function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return <div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

/** Renders supporting text inside a CardHeader. */
export function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

/** Renders the main content region of a Card. */
export function CardContent({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

/** Renders the action region at the bottom of a Card. */
export function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">): React.JSX.Element {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />;
}
