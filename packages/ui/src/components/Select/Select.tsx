import { forwardRef, type ComponentProps } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cx } from "../../cx";

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;

export function Select(props: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;

export function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group {...props} />;
}

export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;

export function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value {...props} />;
}

export type SelectTriggerProps = ComponentProps<
  typeof SelectPrimitive.Trigger
> & {
  size?: "sm" | "default";
};

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    { className, size = "default", children, ...props },
    ref,
  ) {
    return (
      <SelectPrimitive.Trigger
        {...props}
        ref={ref}
        data-size={size}
        className={cx("ui-select-trigger", className)}
      >
        {children}
        <SelectPrimitive.Icon>
          <ChevronIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    {
      className,
      children,
      position = "item-aligned",
      align = "center",
      ...props
    },
    ref,
  ) {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          {...props}
          ref={ref}
          position={position}
          align={align}
          className={cx("ui-select-content", className)}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport className="ui-select-viewport">
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);

export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>;

export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ className, ...props }, ref) {
    return (
      <SelectPrimitive.Label
        {...props}
        ref={ref}
        className={cx("ui-select-label", className)}
      />
    );
  },
);

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem({ className, children, ...props }, ref) {
    return (
      <SelectPrimitive.Item
        {...props}
        ref={ref}
        className={cx("ui-select-item", className)}
      >
        <span className="ui-select-item-indicator">
          <SelectPrimitive.ItemIndicator>
            <CheckIcon />
          </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  },
);

export type SelectSeparatorProps = ComponentProps<
  typeof SelectPrimitive.Separator
>;

export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...props }, ref) {
    return (
      <SelectPrimitive.Separator
        {...props}
        ref={ref}
        className={cx("ui-select-separator", className)}
      />
    );
  },
);

export type SelectScrollUpButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>;

export const SelectScrollUpButton = forwardRef<
  HTMLDivElement,
  SelectScrollUpButtonProps
>(function SelectScrollUpButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollUpButton
      {...props}
      ref={ref}
      className={cx("ui-select-scroll-button", className)}
    >
      <ChevronIcon direction="up" />
    </SelectPrimitive.ScrollUpButton>
  );
});

export type SelectScrollDownButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>;

export const SelectScrollDownButton = forwardRef<
  HTMLDivElement,
  SelectScrollDownButtonProps
>(function SelectScrollDownButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollDownButton
      {...props}
      ref={ref}
      className={cx("ui-select-scroll-button", className)}
    >
      <ChevronIcon />
    </SelectPrimitive.ScrollDownButton>
  );
});

function ChevronIcon({ direction = "down" }: { direction?: "up" | "down" }) {
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
      {direction === "up" ? (
        <path d="m6 15 6-6 6 6" />
      ) : (
        <path d="m6 9 6 6 6-6" />
      )}
    </svg>
  );
}

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
