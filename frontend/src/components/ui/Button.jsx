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
    bg-primary
    text-primary-foreground
    border border-primary
    hover:bg-primary-hover
    hover:border-border
    focus:ring-0 focus:ring-primary/20
    active:scale-95
    shadow-sm
    hover:shadow-md
  `,

  secondary: `
    bg-secondary
    text-secondary-foreground
    border border-primary
    hover:bg-secondary-hover
    hover:border-border
    focus:ring-0 focus:ring-primary/20
    active:scale-95
    shadow-sm
  `,

  outline: `
    bg-transparent 
    text-primary
    border border-primary
    hover:bg-primary
    hover:text-primary-foreground
    focus:ring-4 focus:ring-primary/20
    active:scale-95
  `,

  ghost: `
    bg-transparent 
    text-primary
    border border-transparent
    hover:bg-hover-overlay
    focus:ring-4 focus:ring-primary/20
    active:scale-95
  `,

  success: `
    bg-success
    text-white 
    border border-success
    hover:bg-success-light
    hover:border-success-light
    focus:ring-4 focus:ring-success/20
    active:scale-95
    shadow-sm
  `,

  warning: `
    bg-warning
    text-white 
    border border-warning
    hover:bg-warning-light
    hover:border-warning-light
    focus:ring-4 focus:ring-warning/20
    active:scale-95
    shadow-sm
  `,

  error: `
    bg-error
    text-white 
    border border-error
    hover:bg-error-light
    hover:border-error-light
    focus:ring-4 focus:ring-error/20
    active:scale-95
    shadow-sm
  `,

  link: `
    bg-transparent 
    text-primary
    border-none
    hover:text-primary
    hover:underline underline-offset-4
    focus:ring-4 focus:ring-primary/20
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
    font-medium rounded-md
    transition-all duration-200
    focus:outline-none focus-visible:outline-none
    disabled:opacity-50 disabled:pointer-events-none
    relative overflow-hidden
    font-family
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
