// Side-effect import for tsup/esbuild (ADR-0011). Do not remove:
// it is the only reason dist/index.css is emitted. A linter or agent
// will see it as unused. Consumers still import '@vianneytraina/ui/styles.css'
// themselves (ADR-0009). ADR-0010 (`sideEffects: ["*.css"]`) is the
// consumer-side counterpart: it stops *their* bundler dropping that
// CSS import. This source import never ships as `src/`; it is baked
// in at package build time.
import "./styles.css";

export { Button } from "./components/Button/Button";
export type {
  ButtonEmphasis,
  ButtonIntent,
  ButtonProps,
  ButtonVariant,
} from "./components/Button/Button";
export { TextField } from "./components/TextField/TextField";
export type { TextFieldProps } from "./components/TextField/TextField";
export { Label } from "./components/Label/Label";
export type { LabelProps } from "./components/Label/Label";
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
  DialogTrigger,
} from "./components/Dialog/Dialog";
export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogPortalProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./components/Dialog/Dialog";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/Select/Select";
export type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from "./components/Select/Select";
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
  DropdownMenuTrigger,
} from "./components/DropdownMenu/DropdownMenu";
export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuPortalProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
} from "./components/DropdownMenu/DropdownMenu";
export { Badge } from "./components/Badge/Badge";
export type { BadgeProps, BadgeVariant } from "./components/Badge/Badge";
