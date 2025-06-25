import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and intelligently merge Tailwind CSS class names.
 * @param  {...any} inputs - Class names or conditions
 * @returns {string} - Merged className string
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
