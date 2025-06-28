/**
 * Main App Component with Redux Integration and Authentication
 * Includes secure routing and state management for banking application
 */

import { useEffect } from "react";
import { Provider } from "react-redux";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Redux Store
import store from "./store";

// Components and Pages
import Navbar from "./components/ui/Navbar";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Home from "./pages/Home";
import LoginPage from "./pages/common/LoginPage";
import SignupPage from "./pages/common/SignupPage";

// Authentication Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthStateManager from "./components/auth/AuthStateManager";
import UserDashboard from "./pages/User/UserDashboard";

/**
 * App Router Component (inside Redux Provider)
 */
function AppRouter() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {/* Authentication State Manager - handles token refresh and session management */}
      <AuthStateManager />

      {/* Toast Notifications for user feedback */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />

      {/* Navigation - Only show when NOT on admin routes or auth pages */}
      {!isAdminRoute && !isAuthRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>User Profile (TODO: Create component)</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <div>Transactions (TODO: Create component)</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div>Settings (TODO: Create component)</div>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/**
 * Main App Component with Redux Provider
 */
function App() {
  useEffect(() => {
    // Set up global error handlers for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error("[APP] Unhandled Promise Rejection:", event.reason);

      // In production, you might want to send this to an error reporting service
      if (process.env.NODE_ENV === "production") {
        // Example: Sentry.captureException(event.reason);
      }
    };

    const handleError = (event) => {
      console.error("[APP] Global Error:", event.error);

      // In production, you might want to send this to an error reporting service
      if (process.env.NODE_ENV === "production") {
        // Example: Sentry.captureException(event.error);
      }
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Set up performance monitoring
    if (process.env.NODE_ENV === "development") {
      console.log("[APP] StyloPay Banking Application Started");
      console.log("[APP] Environment:", {
        nodeEnv: process.env.NODE_ENV,
        apiUrl:
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
        version: "1.0.0",
      });
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background">
        <AppRouter />
      </div>
    </Provider>
  );
}

export default App;
