import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../cx";

export type ButtonIntent = "neutral" | "danger";
export type ButtonEmphasis = "filled" | "ghost" | "outline";

/** @deprecated Use `intent` and `emphasis`. Removed in 2.0.0. */
export type ButtonVariant = "default" | "ghost" | "outline" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  /** @deprecated Use `intent` and `emphasis`. Removed in 2.0.0. */
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  emphasis?: ButtonEmphasis;
};

const VARIANT_TO_APPEARANCE = {
  default: { intent: "neutral", emphasis: "filled" },
  ghost: { intent: "neutral", emphasis: "ghost" },
  outline: { intent: "neutral", emphasis: "outline" },
  danger: { intent: "danger", emphasis: "filled" },
} as const satisfies Record<
  ButtonVariant,
  { intent: ButtonIntent; emphasis: ButtonEmphasis }
>;

function resolveAppearance(
  variant: ButtonVariant | undefined,
  intent: ButtonIntent | undefined,
  emphasis: ButtonEmphasis | undefined,
): { intent: ButtonIntent; emphasis: ButtonEmphasis } {
  if (intent !== undefined || emphasis !== undefined) {
    return {
      intent: intent ?? "neutral",
      emphasis: emphasis ?? "filled",
    };
  }

  if (variant !== undefined) {
    return VARIANT_TO_APPEARANCE[variant];
  }

  return { intent: "neutral", emphasis: "filled" };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      type = "button",
      variant,
      intent: intentProp,
      emphasis: emphasisProp,
      className,
      ...props
    },
    ref,
  ) {
    if (process.env.NODE_ENV !== "production" && variant !== undefined) {
      console.warn(
        "[@vianneytraina/ui] Button: `variant` is deprecated. Use `intent` and `emphasis` instead.",
      );
    }

    const { intent, emphasis } = resolveAppearance(
      variant,
      intentProp,
      emphasisProp,
    );

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        data-variant={variant}
        data-intent={intent}
        data-emphasis={emphasis}
        className={cx("ui-button", className)}
      >
        {children}
      </button>
    );
  },
);
