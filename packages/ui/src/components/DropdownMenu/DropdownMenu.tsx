import { forwardRef, type ComponentProps } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cx } from "../../cx";

export type DropdownMenuProps = ComponentProps<typeof DropdownMenuPrimitive.Root>;

export function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export type DropdownMenuTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
>;

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(function DropdownMenuTrigger({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Trigger
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-trigger", className)}
    />
  );
});

export type DropdownMenuPortalProps = ComponentProps<
  typeof DropdownMenuPrimitive.Portal
>;

export function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export type DropdownMenuContentProps = ComponentProps<
  typeof DropdownMenuPrimitive.Content
>;

export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(function DropdownMenuContent(
  { className, sideOffset = 4, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        {...props}
        ref={ref}
        sideOffset={sideOffset}
        className={cx("ui-dropdown-menu-content", className)}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export type DropdownMenuGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.Group
>;

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <DropdownMenuPrimitive.Group {...props} />;
}

export type DropdownMenuItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.Item
> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { className, inset, variant = "default", ...props },
    ref,
  ) {
    return (
      <DropdownMenuPrimitive.Item
        {...props}
        ref={ref}
        data-inset={inset}
        data-variant={variant}
        className={cx("ui-dropdown-menu-item", className)}
      />
    );
  },
);

export type DropdownMenuCheckboxItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

export const DropdownMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem(
  { className, children, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-checkbox-item", className)}
    >
      <span className="ui-dropdown-menu-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

export type DropdownMenuRadioGroupProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
>;

export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

export type DropdownMenuRadioItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>;

export const DropdownMenuRadioItem = forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-radio-item", className)}
    >
      <span className="ui-dropdown-menu-item-indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

export type DropdownMenuLabelProps = ComponentProps<
  typeof DropdownMenuPrimitive.Label
> & {
  inset?: boolean;
};

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      {...props}
      ref={ref}
      data-inset={inset}
      className={cx("ui-dropdown-menu-label", className)}
    />
  );
});

export type DropdownMenuSeparatorProps = ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>;

export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-separator", className)}
    />
  );
});

export type DropdownMenuShortcutProps = ComponentProps<"span">;

export const DropdownMenuShortcut = forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(function DropdownMenuShortcut({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-shortcut", className)}
    />
  );
});

export type DropdownMenuSubProps = ComponentProps<typeof DropdownMenuPrimitive.Sub>;

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export type DropdownMenuSubTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  inset?: boolean;
};

export const DropdownMenuSubTrigger = forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger(
  { className, inset, children, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      {...props}
      ref={ref}
      data-inset={inset}
      className={cx("ui-dropdown-menu-sub-trigger", className)}
    >
      {children}
      <ChevronRightIcon />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

export type DropdownMenuSubContentProps = ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>;

export const DropdownMenuSubContent = forwardRef<
  HTMLDivElement,
  DropdownMenuSubContentProps
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      {...props}
      ref={ref}
      className={cx("ui-dropdown-menu-sub-content", className)}
    />
  );
});

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
