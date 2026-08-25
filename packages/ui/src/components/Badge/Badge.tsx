import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../cx";

export type BadgeVariant = "default" | "accent";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant?: BadgeVariant;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, className, variant = "default", ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      data-variant={variant}
      className={cx("ui-badge", className)}
    >
      {children}
    </span>
  );
});
