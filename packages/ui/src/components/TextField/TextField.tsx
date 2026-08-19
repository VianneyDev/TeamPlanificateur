import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../../cx";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ className, type = "text", ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        type={type}
        className={cx("ui-text-field", className)}
      />
    );
  },
);
