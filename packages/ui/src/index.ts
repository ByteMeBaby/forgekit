// Publishes the explicit public surface of the ForgeKit UI package.

/**
 * Imported by the web app to thread a real compiled import along the UI dependency edge,
 * making turbo dependsOn ordering and dist-consumption real rather than assumed.
 */
export const UI_VERSION = "0.0.0";

// Utilities
export { cn } from "./lib/cn.js";

// Button
export { Button, buttonVariants } from "./components/button.js";
export type { ButtonProps, ButtonVariantProps } from "./components/button.js";

// Layout and form controls
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/card.js";
export { Input } from "./components/input.js";
export { Label } from "./components/label.js";

// Navigation
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs.js";

// Overlays
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from "./components/dialog.js";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "./components/dropdown-menu.js";

// Media
export { Avatar, AvatarFallback, AvatarImage } from "./components/avatar.js";
