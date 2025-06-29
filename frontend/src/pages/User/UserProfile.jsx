import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  MapPin,
  CreditCard,
  Settings,
  Lock,
  Bell,
  Check,
  AlertCircle,
  UserCircle,
  Building,
  Globe,
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
} from "../../store/slices/authSlice";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "../../store/api/userApi";

export default function UserProfile() {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Redux state
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // API hooks
  const {
    data: fullProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    mode: "onBlur",
  });

  // Update form when profile data loads
  useEffect(() => {
    if (fullProfile) {
      reset({
        firstName: fullProfile.firstName || "",
        lastName: fullProfile.lastName || "",
        email: fullProfile.email || "",
        phone: fullProfile.phone || "",
        dateOfBirth: fullProfile.dateOfBirth || "",
        address: fullProfile.address || "",
        city: fullProfile.city || "",
        state: fullProfile.state || "",
        country: fullProfile.country || "",
        postalCode: fullProfile.postalCode || "",
      });
    }
  }, [fullProfile, reset]);

  // Handle profile update
  const onSubmit = async (data) => {
    try {
      console.log("[USER PROFILE] Updating profile:", data);

      const result = await updateProfile(data).unwrap();

      // Update Redux state
      dispatch(updateUserProfile(result.user));

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetchProfile();
    } catch (error) {
      console.error("[USER PROFILE] Update failed:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get user display data
  const profileData = fullProfile || user;
  const displayName =
    profileData?.fullName ||
    `${profileData?.firstName || ""} ${profileData?.lastName || ""}`.trim() ||
    profileData?.email ||
    "User";
  const initials =
    profileData?.firstName && profileData?.lastName
      ? `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(
          0
        )}`.toUpperCase()
      : profileData?.email?.charAt(0).toUpperCase() || "U";

  // Tab configuration
  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sticky top-8">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md hover:bg-primary-hover transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-foreground mt-4">
                  {displayName}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {profileData?.email}
                </p>

                {/* Status Badges */}
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      profileData?.role === "admin"
                        ? "bg-error/10 text-error dark:bg-error/20 dark:text-error"
                        : profileData?.role === "premium"
                        ? "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning"
                        : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                    }`}
                  >
                    {profileData?.role?.charAt(0).toUpperCase() +
                      profileData?.role?.slice(1)}
                  </div>
                  {profileData?.isVerified && (
                    <div className="flex items-center space-x-1 text-xs px-2 py-1 bg-success/10 text-success dark:bg-success/20 dark:text-success rounded-full">
                      <Shield className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Profile Completeness
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {profileData?.profileCompleteness || 45}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-hover h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${profileData?.profileCompleteness || 45}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-foreground font-medium">
                    {profileData?.createdAt
                      ? new Date(profileData.createdAt).getFullYear()
                      : "2024"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Status</span>
                  <span
                    className={`font-medium ${
                      profileData?.accountStatus === "active"
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {profileData?.accountStatus?.charAt(0).toUpperCase() +
                      profileData?.accountStatus?.slice(1) || "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Login</span>
                  <span className="text-foreground font-medium">
                    {profileData?.lastLogin
                      ? new Date(profileData.lastLogin).toLocaleDateString()
                      : "Today"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl shadow-lg border border-border">
              {/* Tabs */}
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Personal Information
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Update your personal details and information
                        </p>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit3 className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            leftIcon={<X className="w-4 h-4" />}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmit(onSubmit)}
                            size="sm"
                            disabled={isUpdating || !isDirty}
                            isLoading={isUpdating}
                            leftIcon={<Save className="w-4 h-4" />}
                          >
                            {isUpdating ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...register("firstName", {
                              required: "First name is required",
                              minLength: {
                                value: 2,
                                message:
                                  "First name must be at least 2 characters",
                              },
                            })}
                            disabled={!isEditing}
                            error={errors.firstName?.message}
                            className={
                              !isEditing
                                ? "bg-muted"
                                : ""
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...register("lastName", {
                              required: "Last name is required",
                              minLength: {
                                value: 2,
                                message:
                                  "Last name must be at least 2 characters",
                              },
                            })}
                            disabled={!isEditing}
                            error={errors.lastName?.message}
                            className={
                              !isEditing
                                ? "bg-muted"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          disabled={true} // Email should not be editable
                          error={errors.email?.message}
                          className="bg-muted"
                          rightIcon={
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone", {
                            pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: "Invalid phone number",
                            },
                          })}
                          disabled={!isEditing}
                          error={errors.phone?.message}
                          className={
                            !isEditing
                              ? "bg-muted"
                              : ""
                          }
                          rightIcon={
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          }
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register("dateOfBirth")}
                          disabled={!isEditing}
                          error={errors.dateOfBirth?.message}
                          className={
                            !isEditing
                              ? "bg-muted"
                              : ""
                          }
                          rightIcon={
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          }
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          {...register("address")}
                          disabled={!isEditing}
                          error={errors.address?.message}
                          className={
                            !isEditing
                              ? "bg-muted"
                              : ""
                          }
                          rightIcon={
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                          }
                        />
                      </div>

                      {/* City, State, Country */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            {...register("city")}
                            disabled={!isEditing}
                            error={errors.city?.message}
                            className={
                              !isEditing
                                ? "bg-muted"
                                : ""
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            {...register("state")}
                            disabled={!isEditing}
                            error={errors.state?.message}
                            className={
                              !isEditing
                                ? "bg-muted"
                                : ""
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            {...register("country")}
                            disabled={!isEditing}
                            error={errors.country?.message}
                            className={
                              !isEditing
                                ? "bg-muted"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      {/* Postal Code */}
                      <div className="md:w-1/3">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          {...register("postalCode")}
                          disabled={!isEditing}
                          error={errors.postalCode?.message}
                          className={
                            !isEditing
                              ? "bg-muted"
                              : ""
                          }
                        />
                      </div>
                    </form>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === "contact" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Contact Information
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <Mail className="w-5 h-5 text-primary" />
                            <h4 className="font-medium">Email</h4>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            Primary email address
                          </p>
                          <p className="font-medium">{profileData?.email}</p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <Phone className="w-5 h-5 text-primary" />
                            <h4 className="font-medium">Phone</h4>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            Mobile number
                          </p>
                          <p className="font-medium">
                            {profileData?.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">Address</h4>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Current address
                        </p>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {profileData?.address || "Not provided"}
                          </p>
                          {(profileData?.city ||
                            profileData?.state ||
                            profileData?.country) && (
                            <p className="text-sm text-muted-foreground">
                              {[
                                profileData?.city,
                                profileData?.state,
                                profileData?.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                              {profileData?.postalCode &&
                                ` ${profileData.postalCode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Security Settings
                    </h3>
                    <div className="space-y-6">
                      {/* Account Status */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium mb-1">Account Status</h4>
                            <p className="text-sm text-muted-foreground">
                              Current verification status
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {profileData?.isVerified ? (
                              <div className="flex items-center space-x-2 text-success">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Verified
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-warning">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Pending
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Two Factor Authentication */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium mb-1">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {profileData?.twoFactorEnabled
                              ? "Manage"
                              : "Enable"}
                          </Button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium mb-1">Password</h4>
                            <p className="text-sm text-muted-foreground">
                              Last changed:{" "}
                              {profileData?.passwordChangedAt
                                ? new Date(
                                    profileData.passwordChangedAt
                                  ).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            leftIcon={<Lock className="w-4 h-4" />}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Preferences
                    </h3>
                    <div className="space-y-6">
                      {/* Notifications */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <Bell className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">Notifications</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email notifications</span>
                            <input
                              type="checkbox"
                              defaultChecked={profileData?.notifications?.email}
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">SMS notifications</span>
                            <input
                              type="checkbox"
                              defaultChecked={profileData?.notifications?.sms}
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Marketing emails</span>
                            <input
                              type="checkbox"
                              defaultChecked={
                                profileData?.notifications?.marketing
                              }
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Privacy */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">Privacy</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Profile visibility</span>
                            <select className="text-sm border border-border rounded px-2 py-1 bg-background">
                              <option>Private</option>
                              <option>Public</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Activity status</span>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                          </div>
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
    </div>
  );
}
