import { Menu, Bell, Search, Settings } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useSidebar } from "../../context/SidebarContext";

export default function AdminHeader() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="backdrop-blur-xl bg-background border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between p-4 lg:p-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:bg-hover-overlay"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-lg font-medium text-primary font-primary">
              Dashboard
            </h1>
            <p className="text-sm text-foreground">Welcome back, Admin! ✨</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
            <Input
              placeholder="Search anything..."
              className="pl-10 w-48 lg:w-64 bg-background border-border text-primary placeholder:text-secondary focus:border-primary transition-base"
            />
          </div>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-secondary hover:bg-hover-overlay hover:text-primary"
          >
            <Search className="w-5 h-5 text-foreground" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-secondary hover:bg-hover-overlay hover:text-primary"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse">
              <span className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping"></span>
            </span>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-secondary hover:bg-hover-overlay hover:text-primary"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
