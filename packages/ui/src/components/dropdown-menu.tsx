// Defines the ForgeKit wrappers for Radix dropdown menu primitives.

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../lib/cn.js";

import type React from "react";

type DropdownMenuItemProps = React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

type DropdownMenuLabelProps = React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
};

type DropdownMenuSubTriggerProps = React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
};

/** Renders the root container that manages a dropdown menu's open state. */
export function DropdownMenu(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Root>): React.JSX.Element {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/** Renders the control that opens a DropdownMenu. */
export function DropdownMenuTrigger(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Trigger>): React.JSX.Element {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

/** Renders DropdownMenu descendants into a portal. */
export function DropdownMenuPortal(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Portal>): React.JSX.Element {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

/** Renders a portalled list of DropdownMenu items. */
export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Content>): React.JSX.Element {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

/** Renders a semantic group inside a DropdownMenu. */
export function DropdownMenuGroup(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Group>): React.JSX.Element {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

/** Renders an actionable DropdownMenu item. */
export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps): React.JSX.Element {
  const insetAttributes = inset ? { "data-inset": "" } : {};

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...insetAttributes}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

/** Renders a checkable DropdownMenu item. */
export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.CheckboxItem>): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span data-slot="dropdown-menu-item-indicator" className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/** Renders the controller for a mutually exclusive DropdownMenu item group. */
export function DropdownMenuRadioGroup(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.RadioGroup>): React.JSX.Element {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

/** Renders a radio-selectable DropdownMenu item. */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.RadioItem>): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span data-slot="dropdown-menu-item-indicator" className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

/** Renders non-interactive context text in a DropdownMenu. */
export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps): React.JSX.Element {
  const insetAttributes = inset ? { "data-inset": "" } : {};

  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      {...insetAttributes}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props}
    />
  );
}

/** Renders a visual separator between DropdownMenu groups. */
export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Separator>): React.JSX.Element {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

/** Renders a keyboard shortcut hint aligned within a DropdownMenu item. */
export function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentPropsWithRef<"span">): React.JSX.Element {
  return <span data-slot="dropdown-menu-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

/** Renders the root container for a nested DropdownMenu. */
export function DropdownMenuSub(props: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Sub>): React.JSX.Element {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

/** Renders the control that opens a nested DropdownMenu. */
export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps): React.JSX.Element {
  const insetAttributes = inset ? { "data-inset": "" } : {};

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      {...insetAttributes}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/** Renders the content surface for a nested DropdownMenu. */
export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubContent>): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}
