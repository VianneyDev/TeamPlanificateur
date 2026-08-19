import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../cx";

/** v1 mixed API: intent and emphasis share one prop. A10 splits this. */
export type ButtonVariant = "default" | "ghost" | "outline" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      type = "button",
      variant = "default",
      className,
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        data-variant={variant}
        className={cx("ui-button", className)}
      >
        {children}
      </button>
    );
  },
);
