import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Shield,
  UserCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Redux
import {
  selectUser,
  selectIsAuthenticated,
  logout,
} from "../../store/slices/authSlice";
import { useLogoutMutation } from "../../store/api/authApi";

export default function UserDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Redux state
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // API hooks
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsOpen(false);
      console.log("[USER DROPDOWN] Logging out user");

      // Call logout API
      await logoutMutation().unwrap();

      // Clear Redux state
      dispatch(logout());

      // Clear local storage
      localStorage.removeItem("stylopay_token");
      sessionStorage.removeItem("stylopay_token");
      localStorage.removeItem("stylopay_auth_state");

      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("[USER DROPDOWN] Logout error:", error);

      // Even if API call fails, clear local state
      dispatch(logout());
      localStorage.removeItem("stylopay_token");
      sessionStorage.removeItem("stylopay_token");
      localStorage.removeItem("stylopay_auth_state");

      toast.error("Logout failed, but you've been signed out locally");
      navigate("/login", { replace: true });
    }
  };

  // Handle menu item clicks
  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/user/profile");
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate("/user/settings");
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user display name
  const displayName =
    user.fullName || `${user.firstName} ${user.lastName}` || user.email;
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 bg-card border border-border py-2 rounded-lg transition-all duration-200 hover:bg-muted dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
            {initials}
          </div>
          {/* Online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card shadow-sm"></div>
        </div>

        {/* User Info - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-foreground truncate max-w-[120px]">
            {displayName.split(" ")[0]} {/* Show first name only */}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {user.role}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card rounded-xl shadow-lg border border-border py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground text-lg font-semibold shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === "admin"
                        ? "bg-error/10 text-error dark:bg-error/20 dark:text-error"
                        : user.role === "premium"
                        ? "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning"
                        : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                  {user.isVerified && (
                    <div className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-success/10 text-success dark:bg-success/20 dark:text-success rounded-full">
                      <Shield className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted dark:hover:bg-muted transition-colors duration-150"
            >
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              <span>View Profile</span>
            </button>

            {/* Account Settings */}
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted dark:hover:bg-muted transition-colors duration-150"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Account Settings</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-border/20"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 dark:hover:bg-error/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 text-error" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
