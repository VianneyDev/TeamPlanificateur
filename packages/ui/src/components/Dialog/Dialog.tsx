import { forwardRef, type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cx } from "../../cx";

export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}

export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Trigger
        {...props}
        ref={ref}
        className={cx("ui-dialog-trigger", className)}
      />
    );
  },
);

export type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;

export function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal {...props} />;
}

export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Close
        {...props}
        ref={ref}
        className={cx("ui-dialog-close", className)}
      />
    );
  },
);

export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        {...props}
        ref={ref}
        className={cx("ui-dialog-overlay", className)}
      />
    );
  },
);

export type DialogContentProps = ComponentProps<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean;
};

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    { className, children, showCloseButton = true, ...props },
    ref,
  ) {
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          {...props}
          ref={ref}
          className={cx("ui-dialog-content", className)}
        >
          {children}
          {showCloseButton ? (
            <DialogClose>
              <CloseIcon />
              <span className="ui-sr-only">Fermer</span>
            </DialogClose>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);

export type DialogHeaderProps = ComponentProps<"div">;

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div {...props} ref={ref} className={cx("ui-dialog-header", className)} />
    );
  },
);

export type DialogFooterProps = ComponentProps<"div">;

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div {...props} ref={ref} className={cx("ui-dialog-footer", className)} />
    );
  },
);

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Title
        {...props}
        ref={ref}
        className={cx("ui-dialog-title", className)}
      />
    );
  },
);

export type DialogDescriptionProps = ComponentProps<
  typeof DialogPrimitive.Description
>;

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      {...props}
      ref={ref}
      className={cx("ui-dialog-description", className)}
    />
  );
});

function CloseIcon() {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
