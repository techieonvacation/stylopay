import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

// Collapsible Context
const CollapsibleContext = createContext();

const useCollapsible = () => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used within a Collapsible");
  }
  return context;
};

// Main Collapsible Component
const Collapsible = React.forwardRef(
  ({ defaultOpen = false, open, onOpenChange, disabled = false, className, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    
    const handleToggle = () => {
      if (disabled) return;
      
      if (isControlled) {
        onOpenChange?.(!open);
      } else {
        setInternalOpen(!internalOpen);
        onOpenChange?.(!internalOpen);
      }
    };

    const contextValue = {
      open: isOpen,
      onToggle: handleToggle,
      disabled,
    };

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          data-state={isOpen ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

// Collapsible Trigger Component
const CollapsibleTrigger = React.forwardRef(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { onToggle, disabled, open } = useCollapsible();
    
    const handleClick = (event) => {
      event.preventDefault();
      onToggle();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    };

    if (asChild) {
      return React.cloneElement(children, {
        ref,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        "aria-expanded": open,
        "aria-disabled": disabled,
        "data-state": open ? "open" : "closed",
        "data-disabled": disabled ? "" : undefined,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full items-center justify-between py-4 font-medium transition-all",
          "hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

// Collapsible Content Component
const CollapsibleContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open } = useCollapsible();

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all",
          "data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down",
          className
        )}
        data-state={open ? "open" : "closed"}
        style={{
          "--radix-collapsible-content-height": "var(--height)",
          "--radix-collapsible-content-width": "var(--width)",
        }}
        {...props}
      >
        <div className={cn("pb-4 pt-0", open ? "block" : "hidden")}>
          {children}
        </div>
      </div>
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent }; 