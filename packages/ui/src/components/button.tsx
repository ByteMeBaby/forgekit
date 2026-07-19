// Defines the ForgeKit Button and its visual-variant recipe.

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../lib/cn.js";

import type { VariantProps } from "class-variance-authority";
import type React from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

/** Variant options accepted by Button. */
export type ButtonVariantProps = VariantProps<typeof buttonStyles>;

/** Props accepted by Button. `asChild` renders the single child as the button. */
export type ButtonProps = React.ComponentPropsWithRef<"button"> &
  ButtonVariantProps & {
    asChild?: boolean;
  };

/** Returns the class string for a Button visual variant and size. */
export function buttonVariants(options?: ButtonVariantProps): string {
  return buttonStyles(options);
}

/** Renders the ForgeKit action control (a native button, or its child via `asChild`). */
export function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: ButtonProps): React.JSX.Element {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-slot="button"
      className={cn(buttonStyles({ size, variant }), className)}
      {...props}
    />
  );
}
