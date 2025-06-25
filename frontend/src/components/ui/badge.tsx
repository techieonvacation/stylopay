import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[--brand-primary] text-white hover:bg-[--brand-primary-hover] focus:ring-[--brand-primary]/20",
        secondary:
          "border-transparent bg-[--neutral-100] text-[--text-primary] hover:bg-[--neutral-200] focus:ring-[--neutral-400]/20",
        destructive:
          "border-transparent bg-[--color-error] text-white hover:bg-[--color-error-light] focus:ring-[--color-error]/20",
        outline: 
          "border-[--border-primary] text-[--text-primary] bg-transparent hover:bg-[--neutral-50] focus:ring-[--brand-primary]/20",
        success: 
          "border-transparent bg-[--color-success] text-white hover:bg-[--color-success-light] focus:ring-[--color-success]/20",
        warning:
          "border-transparent bg-[--color-warning] text-white hover:bg-[--color-warning-light] focus:ring-[--color-warning]/20",
        info:
          "border-transparent bg-[--color-info] text-white hover:bg-[--color-info-light] focus:ring-[--color-info]/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({ 
  className, 
  variant, 
  size,
  children,
  ...props 
}) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

Badge.displayName = "Badge";

export { Badge, badgeVariants };
