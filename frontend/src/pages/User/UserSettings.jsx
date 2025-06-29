import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Settings,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";

// Redux
import {
  selectUser,
  selectIsAuthenticated,
  updateUserProfile,
  updateSecurityStatus,
} from "../../store/slices/authSlice";
import {
  useChangePasswordMutation,
  useUpdateUserProfileMutation,
  useLogoutAllSessionsMutation,
} from "../../store/api/userApi";

export default function UserSettings() {
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState("password");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Redux state
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // API hooks
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [logoutAllSessions, { isLoading: isLoggingOutAll }] = useLogoutAllSessionsMutation();

  // Form handling for password change
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm({
    mode: "onBlur",
  });

  // Form handling for notifications
  const {
    register: registerNotifications,
    handleSubmit: handleNotificationsSubmit,
    reset: resetNotifications,
    formState: { errors: notificationErrors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      emailNotifications: user?.notifications?.email || true,
      smsNotifications: user?.notifications?.sms || false,
      pushNotifications: user?.notifications?.push || true,
      marketingEmails: user?.notifications?.marketing || false,
    },
  });

  // Handle password change
  const onPasswordSubmit = async (data) => {
    try {
      console.log("[USER SETTINGS] Changing password");

      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error) {
      console.error("[USER SETTINGS] Password change failed:", error);
      toast.error(error.message || "Failed to change password");
    }
  };

  // Handle notification settings update
  const onNotificationsSubmit = async (data) => {
    try {
      console.log("[USER SETTINGS] Updating notification settings:", data);

      const result = await updateProfile({
        notifications: {
          email: data.emailNotifications,
          sms: data.smsNotifications,
          push: data.pushNotifications,
          marketing: data.marketingEmails,
        },
      }).unwrap();

      // Update Redux state
      dispatch(updateUserProfile(result.user));

      toast.success("Notification settings updated!");
    } catch (error) {
      console.error("[USER SETTINGS] Notification update failed:", error);
      toast.error(error.message || "Failed to update notifications");
    }
  };

  // Handle logout from all sessions
  const handleLogoutAllSessions = async () => {
    if (!confirm("Are you sure you want to log out from all devices? You'll need to log in again.")) {
      return;
    }

    try {
      console.log("[USER SETTINGS] Logging out from all sessions");

      await logoutAllSessions().unwrap();

      toast.success("Logged out from all devices successfully!");
      
      // The API should handle logout, but just in case
      window.location.href = "/login";
    } catch (error) {
      console.error("[USER SETTINGS] Logout all sessions failed:", error);
      toast.error(error.message || "Failed to logout from all sessions");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'To delete your account, type "DELETE" below. This action cannot be undone.'
    );

    if (confirmation !== "DELETE") {
      toast.error("Account deletion cancelled");
      return;
    }

    try {
      console.log("[USER SETTINGS] Deleting account");
      
      // This would need to be implemented in the API
      toast.error("Account deletion is not yet implemented. Please contact support.");
      
    } catch (error) {
      console.error("[USER SETTINGS] Account deletion failed:", error);
      toast.error(error.message || "Failed to delete account");
    }
  };

  // Password validation
  const newPassword = watchPassword("newPassword");

  // Settings sections
  const sections = [
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please log in to access settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your security, notifications, and account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-4 sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              
              {/* Password Section */}
              {activeSection === "password" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
                  </div>

                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...registerPassword("currentPassword", {
                            required: "Current password is required",
                          })}
                          error={passwordErrors.currentPassword?.message}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                              message: "Password must contain uppercase, lowercase, number, and special character",
                            },
                          })}
                          error={passwordErrors.newPassword?.message}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === newPassword || "Passwords do not match",
                        })}
                        error={passwordErrors.confirmPassword?.message}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      isLoading={isChangingPassword}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>
                  </div>

                  <form onSubmit={handleNotificationsSubmit(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive important updates via email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerNotifications("emailNotifications")}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">SMS Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts via text message
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerNotifications("smsNotifications")}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      </div>

                      {/* Push Notifications */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Push Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications in your browser
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerNotifications("pushNotifications")}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      </div>

                      {/* Marketing Emails */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Marketing Emails</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive promotional offers and updates
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerNotifications("marketingEmails")}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      isLoading={isUpdatingProfile}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isUpdatingProfile ? "Saving..." : "Save Preferences"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {user?.twoFactorEnabled ? "Manage" : "Enable"}
                        </Button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Active Sessions</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage and monitor your active login sessions
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogoutAllSessions}
                          disabled={isLoggingOutAll}
                          isLoading={isLoggingOutAll}
                        >
                          {isLoggingOutAll ? "Logging out..." : "Logout All Devices"}
                        </Button>
                      </div>
                    </div>

                    {/* Login Activity */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium text-foreground mb-3">Recent Login Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-foreground">Current session</p>
                            <p className="text-muted-foreground">Today at {new Date().toLocaleTimeString()}</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm">
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-foreground">Mobile device</p>
                            <p className="text-muted-foreground">Yesterday at 3:42 PM</p>
                          </div>
                          <div className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              {activeSection === "danger" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="w-5 h-5 text-error" />
                    <h2 className="text-xl font-semibold text-foreground">Danger Zone</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Logout All Sessions */}
                    <div className="p-4 border-2 border-warning/20 rounded-lg bg-warning/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Logout from all devices</h3>
                          <p className="text-sm text-muted-foreground">
                            This will sign you out of all devices and browsers
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogoutAllSessions}
                          disabled={isLoggingOutAll}
                          isLoading={isLoggingOutAll}
                          leftIcon={<X className="w-4 h-4" />}
                          className="border-warning text-warning hover:bg-warning/10"
                        >
                          {isLoggingOutAll ? "Logging out..." : "Logout All"}
                        </Button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="p-4 border-2 border-error/20 rounded-lg bg-error/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground mb-1">Delete Account</h3>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteAccount}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="border-error text-error hover:bg-error/10"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 