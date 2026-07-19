// Defines the ForgeKit wrapper around the Radix accessible label primitive.

import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "../lib/cn.js";

import type React from "react";

/** Renders an accessible label associated with a form control. */
export function Label({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>): React.JSX.Element {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
