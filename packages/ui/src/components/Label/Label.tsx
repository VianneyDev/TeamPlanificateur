import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../cx";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  function Label({ children, className, ...props }, ref) {
    return (
      <label {...props} ref={ref} className={cx("ui-label", className)}>
        {children}
      </label>
    );
  },
);
