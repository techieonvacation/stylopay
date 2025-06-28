import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Helper functions for safe localStorage operations
const getStoredTheme = () => {
  try {
    return localStorage.getItem("stylopay-theme");
  } catch (error) {
    console.warn("localStorage not available:", error);
    return null;
  }
};

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem("stylopay-theme", theme);
  } catch (error) {
    console.warn("Could not save theme to localStorage:", error);
  }
};

const removeStoredTheme = () => {
  try {
    localStorage.removeItem("stylopay-theme");
  } catch (error) {
    console.warn("Could not remove theme from localStorage:", error);
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // First priority: Check if user has a saved preference in localStorage
    const savedTheme = getStoredTheme();
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    // Second priority: Check system preference
    try {
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (error) {
      console.warn("Could not detect system theme preference:", error);
    }

    // Default fallback
    return "light";
  });

  // Apply theme to document and save to localStorage
  useEffect(() => {
    try {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Save user's preference to localStorage
      setStoredTheme(theme);
    } catch (error) {
      console.warn("Could not apply theme:", error);
    }
  }, [theme]);

  // Listen for system theme changes (optional: respect system changes if user hasn't manually set preference)
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !window.matchMedia) {
        return;
      }

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e) => {
        // Only auto-change if user hasn't manually set a preference
        const savedTheme = getStoredTheme();
        if (!savedTheme) {
          setTheme(e.matches ? "dark" : "light");
        }
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    } catch (error) {
      console.warn("Could not set up system theme listener:", error);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Reset to system preference
  const resetToSystemTheme = () => {
    removeStoredTheme();
    try {
      const systemTheme =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      setTheme(systemTheme);
    } catch (error) {
      console.warn(
        "Could not detect system theme, falling back to light:",
        error
      );
      setTheme("light");
    }
  };

  const isSystemTheme = !getStoredTheme();

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        resetToSystemTheme,
        isSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
