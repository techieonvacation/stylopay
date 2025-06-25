import React from "react";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu.jsx";
import {
  ChevronDownIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
} from "lucide-react";

function ComponentDemo() {
  const [showNotifications, setShowNotifications] = React.useState(true);
  const [position, setPosition] = React.useState("bottom");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[--text-primary]">
          UI Components Demo
        </h1>
        <p className="text-[--text-secondary] max-w-2xl mx-auto">
          Production-ready Badge and DropdownMenu components with responsive
          design and consistent color theming from your design system.
        </p>
      </div>

      {/* Badge Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[--text-primary] border-b border-[--border-primary] pb-2">
          Badge Component
        </h2>

        {/* Badge Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[--text-secondary]">
            Variants
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        {/* Badge Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[--text-secondary]">Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm" variant="default">
              Small
            </Badge>
            <Badge size="default" variant="secondary">
              Default
            </Badge>
            <Badge size="lg" variant="success">
              Large
            </Badge>
          </div>
        </div>

        {/* Badge Use Cases */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[--text-secondary]">
            Real-world Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-[--border-primary] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">New Feature</span>
                <Badge variant="info" size="sm">
                  Beta
                </Badge>
              </div>
              <p className="text-sm text-[--text-secondary]">
                Enhanced payment processing with real-time validation.
              </p>
            </div>

            <div className="p-4 border border-[--border-primary] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Server Status</span>
                <Badge variant="success" size="sm">
                  Online
                </Badge>
              </div>
              <p className="text-sm text-[--text-secondary]">
                All systems operational and running smoothly.
              </p>
            </div>

            <div className="p-4 border border-[--border-primary] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Urgent Task</span>
                <Badge variant="destructive" size="sm">
                  High Priority
                </Badge>
              </div>
              <p className="text-sm text-[--text-secondary]">
                Critical security update required immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DropdownMenu Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[--text-primary] border-b border-[--border-primary] pb-2">
          DropdownMenu Component
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Menu */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-[--text-secondary]">
              User Profile Menu
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[--btn-primary-bg] text-[--btn-primary-text] rounded-md hover:bg-[--btn-primary-bg-hover] transition-colors">
                <UserIcon className="h-4 w-4" />
                John Doe
                <ChevronDownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BellIcon className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Settings Menu with Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-[--text-secondary]">
              Settings Menu
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[--border-primary] rounded-md hover:bg-[--neutral-50] transition-colors">
                <SettingsIcon className="h-4 w-4" />
                Preferences
                <ChevronDownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showNotifications}
                  onCheckedChange={setShowNotifications}
                >
                  Show notifications
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Position</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={position}
                  onValueChange={setPosition}
                >
                  <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bottom">
                    Bottom
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="right">
                    Right
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Menu */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-[--text-secondary]">
              Actions Menu
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[--neutral-100] text-[--text-primary] rounded-md hover:bg-[--neutral-200] transition-colors">
                Actions
                <ChevronDownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  Edit
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Duplicate
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Responsive Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[--text-primary] border-b border-[--border-primary] pb-2">
          Responsive Design
        </h2>
        <div className="p-6 bg-[--bg-secondary] rounded-lg">
          <p className="text-[--text-secondary] mb-4">
            These components are fully responsive and adapt to different screen
            sizes:
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info" size="sm" className="sm:text-xs md:text-sm">
                Responsive Badge
              </Badge>
              <Badge variant="success" className="hidden sm:inline-flex">
                Visible on SM+
              </Badge>
              <Badge variant="warning" className="hidden md:inline-flex">
                Visible on MD+
              </Badge>
            </div>
            <p className="text-sm text-[--text-tertiary]">
              DropdownMenu automatically adjusts its max-width on mobile devices
              (max-w-[95vw] on mobile, max-w-[24rem] on desktop).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComponentDemo;
