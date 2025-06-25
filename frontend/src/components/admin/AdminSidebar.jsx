import { useState } from "react";
import {
  BarChart3,
  CreditCard,
  Users,
  Wallet,
  Home,
  PieChart,
  FileText,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Activity,
  Target,
  TrendingUp,
  Briefcase,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  Star,
  Shield,
  Globe,
  MessageSquare,
  HelpCircle,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const menuItems = [
  {
    icon: Home,
    label: "Dashboard",
    active: true,
    badge: "3",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    subItems: [
      { icon: Activity, label: "Performance", badge: "New" },
      { icon: Target, label: "Goals" },
      { icon: TrendingUp, label: "Trends" },
    ],
  },
  {
    icon: CreditCard,
    label: "Transactions",
    subItems: [
      { icon: Plus, label: "Add Transaction" },
      { icon: Eye, label: "View All" },
      { icon: Filter, label: "Filters" },
    ],
  },
  {
    icon: Wallet,
    label: "Wallets",
    badge: "5",
    subItems: [
      { icon: CreditCard, label: "Credit Cards" },
      { icon: Briefcase, label: "Business" },
      { icon: Shield, label: "Savings" },
    ],
  },
  {
    icon: Users,
    label: "Customers",
    subItems: [
      { icon: Plus, label: "Add Customer" },
      { icon: Star, label: "VIP Customers" },
      { icon: MessageSquare, label: "Support" },
    ],
  },
  {
    icon: PieChart,
    label: "Reports",
    subItems: [
      { icon: FileText, label: "Financial Reports" },
      { icon: Download, label: "Export Data" },
      { icon: Calendar, label: "Scheduled" },
    ],
  },
  { icon: FileText, label: "Invoices", badge: "12" },
  {
    icon: Settings,
    label: "Settings",
    subItems: [
      { icon: Shield, label: "Security" },
      { icon: Globe, label: "Preferences" },
      { icon: HelpCircle, label: "Help" },
    ],
  },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const [openDropdowns, setOpenDropdowns] = useState([]);

  const toggleDropdown = (item) => {
    setOpenDropdowns((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-overlay backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-neutral-900 border-r border-secondary shadow-custom-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-custom-md">
              <Zap className="w-6 h-6 text-on-brand" />
            </div>
            <div>
              <span className="text-xl fw-600 text-inverse font-primary">
                StyloPay
              </span>
              <p className="text-fs6 text-tertiary">Admin Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-inverse hover:bg-hover-overlay"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-primary scrollbar-track-neutral-800">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.subItems ? (
                <Collapsible
                  open={openDropdowns.includes(item.label)}
                  onOpenChange={() => toggleDropdown(item.label)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-tertiary hover:bg-hover-overlay hover:text-brand-primary h-12 backdrop-blur-sm transition-base"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-fs5 fw-500">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-brand-primary text-on-brand border-0 text-fs6">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {openDropdowns.includes(item.label) ? (
                        <ChevronDown className="w-4 h-4 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className="w-full justify-start text-secondary hover:bg-hover-overlay hover:text-brand-primary h-10 pl-12 transition-base"
                      >
                        <subItem.icon className="w-4 h-4 mr-3" />
                        <span className="text-fs6">{subItem.label}</span>
                        {subItem.badge && (
                          <Badge className="ml-auto bg-brand-accent text-on-brand border-0 text-fs6">
                            {subItem.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 h-12 transition-base ${
                    item.active
                      ? "bg-brand-primary text-on-brand shadow-custom-md backdrop-blur-sm"
                      : "text-tertiary hover:bg-hover-overlay hover:text-brand-primary backdrop-blur-sm"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-fs5 fw-500">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-brand-primary text-on-brand border-0 text-fs6">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-surface-secondary p-4 rounded-xl border border-secondary shadow-custom-md">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-brand-primary">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback className="bg-brand-primary text-on-brand fw-600">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-fs5 fw-500 text-inverse truncate">
                  Admin User
                </p>
                <p className="text-fs6 text-tertiary truncate">
                  System Administrator
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-tertiary hover:text-inverse hover:bg-hover-overlay"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
