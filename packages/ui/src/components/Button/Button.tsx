import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../cx";

export type ButtonIntent = "neutral" | "danger";
export type ButtonEmphasis = "filled" | "ghost" | "outline";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  intent?: ButtonIntent;
  emphasis?: ButtonEmphasis;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      type = "button",
      intent = "neutral",
      emphasis = "filled",
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
        data-intent={intent}
        data-emphasis={emphasis}
        className={cx("ui-button", className)}
      >
        {children}
      </button>
    );
  },
);
