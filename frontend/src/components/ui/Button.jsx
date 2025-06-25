import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Professional Button Component with Design System Integration
 * Uses CSS custom properties from index.css for consistent theming
 */

// Button size configurations - more explicit sizing
const buttonSizes = {
  xs: {
    padding: "px-3 py-1.5",
    text: "text-xs",
    gap: "gap-1.5",
    minHeight: "min-h-[28px]",
  },
  sm: {
    padding: "px-3 py-2",
    text: "text-sm",
    gap: "gap-2",
    minHeight: "min-h-[32px]",
  },
  md: {
    padding: "px-4 py-2.5",
    text: "text-sm",
    gap: "gap-2",
    minHeight: "min-h-[40px]",
  },
  lg: {
    padding: "px-6 py-3",
    text: "text-base",
    gap: "gap-2.5",
    minHeight: "min-h-[44px]",
  },
  xl: {
    padding: "px-8 py-3.5",
    text: "text-lg",
    gap: "gap-3",
    minHeight: "min-h-[48px]",
  },
  icon: {
    padding: "p-2",
    text: "text-sm",
    gap: "gap-0",
    minHeight: "min-h-[40px] min-w-[40px]",
  },
};

// Button variant configurations using CSS custom properties
const buttonVariants = {
  primary: `
    bg-[var(--btn-primary-bg)] 
    text-[var(--btn-primary-text)] 
    border border-[var(--btn-primary-bg)]
    hover:bg-[var(--btn-primary-bg-hover)] 
    hover:border-[var(--btn-primary-bg-hover)]
    focus:ring-0 focus:ring-[var(--brand-primary)]/20
    active:scale-95
    shadow-[var(--shadow-sm)]
    hover:shadow-[var(--shadow-md)]
  `,

  secondary: `
    bg-[var(--btn-secondary-bg)] 
    text-[var(--btn-secondary-text)] 
    border border-[var(--border-primary)]
    hover:bg-[var(--btn-secondary-bg-hover)] 
    hover:border-[var(--border-secondary)]
    focus:ring-0 focus:ring-[var(--brand-primary)]/20
    active:scale-95
    shadow-[var(--shadow-sm)]
  `,

  outline: `
    bg-transparent 
    text-[var(--brand-primary)] 
    border border-brand-primary
    hover:bg-[var(--brand-primary)] 
    hover:text-[var(--text-on-brand)]
    focus:ring-4 focus:ring-[var(--brand-primary)]/20
    active:scale-95
  `,

  ghost: `
    bg-transparent 
    text-[var(--text-primary)] 
    border border-transparent
    hover:bg-[var(--hover-overlay)]
    focus:ring-4 focus:ring-[var(--brand-primary)]/20
    active:scale-95
  `,

  success: `
    bg-[var(--color-success)] 
    text-white 
    border border-[var(--color-success)]
    hover:bg-[var(--color-success-light)]
    hover:border-[var(--color-success-light)]
    focus:ring-4 focus:ring-[var(--color-success)]/20
    active:scale-95
    shadow-[var(--shadow-sm)]
  `,

  warning: `
    bg-[var(--color-warning)] 
    text-white 
    border border-[var(--color-warning)]
    hover:bg-[var(--color-warning-light)]
    hover:border-[var(--color-warning-light)]
    focus:ring-4 focus:ring-[var(--color-warning)]/20
    active:scale-95
    shadow-[var(--shadow-sm)]
  `,

  error: `
    bg-[var(--color-error)] 
    text-white 
    border border-[var(--color-error)]
    hover:bg-[var(--color-error-light)]
    hover:border-[var(--color-error-light)]
    focus:ring-4 focus:ring-[var(--color-error)]/20
    active:scale-95
    shadow-[var(--shadow-sm)]
  `,

  link: `
    bg-transparent 
    text-[var(--brand-primary)] 
    border-none
    hover:text-[var(--brand-primary-hover)]
    hover:underline underline-offset-4
    focus:ring-4 focus:ring-[var(--brand-primary)]/20
  `,
};

// Loading spinner component
const Spinner = ({ size = "sm" }) => {
  const spinnerSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-7 w-7",
  };

  return (
    <svg
      className={cn("animate-spin", spinnerSizes[size] || spinnerSizes.sm)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

/**
 * Button Component
 *
 * @param {Object} props - Button properties
 * @param {string} props.variant - Button style variant (primary, secondary, outline, ghost, success, warning, error, link)
 * @param {string} props.size - Button size (xs, sm, md, lg, xl, icon)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.motionProps - Framer Motion properties
 */
const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled = false,
      children,
      className,
      // Framer Motion props
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      transition,
      ...props
    },
    ref
  ) => {
    // Get size configuration
    const sizeConfig = buttonSizes[size] || buttonSizes.md;

    // Base classes that apply to all buttons
    const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-[var(--radius-md)]
    transition-all duration-[var(--transition-base)]
    focus:outline-none focus-visible:outline-none
    disabled:opacity-50 disabled:pointer-events-none
    relative overflow-hidden
    font-[var(--font-family-primary)]
  `;

    // Get variant classes
    const variantClasses = buttonVariants[variant] || buttonVariants.primary;

    // Handle special cases for link variant (no padding override)
    const shouldApplyPadding = variant !== "link";

    // Combine all classes with proper priority
    const buttonClasses = cn(
      baseClasses,
      variantClasses,
      // Apply size-based classes only if not link variant
      shouldApplyPadding && sizeConfig.padding,
      sizeConfig.text,
      sizeConfig.gap,
      sizeConfig.minHeight,
      // Full width
      fullWidth && "w-full",
      // Link variant special handling
      variant === "link" && "p-0 min-h-auto",
      className
    );

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        whileHover={whileHover || (isDisabled ? {} : { scale: 1.02 })}
        whileTap={whileTap || (isDisabled ? {} : { scale: 0.98 })}
        transition={
          transition || {
            type: "spring",
            stiffness: 400,
            damping: 25,
          }
        }
        initial={initial}
        animate={animate}
        exit={exit}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner
              size={size === "xs" ? "xs" : size === "sm" ? "sm" : "md"}
            />
          </div>
        )}

        {/* Button Content */}
        <div
          className={cn(
            "flex items-center justify-center",
            sizeConfig.gap,
            isLoading && "opacity-0"
          )}
        >
          {/* Left Icon */}
          {leftIcon && (
            <span className="flex-shrink-0 flex items-center">{leftIcon}</span>
          )}

          {/* Button Text */}
          {children && (
            <span className="flex items-center whitespace-nowrap">
              {children}
            </span>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <span className="flex-shrink-0 flex items-center">{rightIcon}</span>
          )}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonSizes };
