import { Plus, Users, FileText, Wallet, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/Button";

const quickActions = [
  {
    icon: Plus,
    label: "New Transaction",
    description: "Add a new financial transaction",
    primary: true,
  },
  {
    icon: Users,
    label: "Add Customer",
    description: "Register a new customer",
  },
  {
    icon: FileText,
    label: "Generate Report",
    description: "Create financial reports",
  },
  {
    icon: Wallet,
    label: "Manage Wallets",
    description: "Handle wallet operations",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "System configuration",
  },
];

export default function QuickActions() {
  return (
    <Card className="bg-surface-primary border-secondary shadow-custom-lg">
      <CardHeader>
        <CardTitle className="text-fs3 fw-600 text-primary font-primary">
          Quick Actions
        </CardTitle>
        <CardDescription className="text-secondary">
          Frequently used features and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.primary ? "default" : "ghost"}
            className={`w-full justify-start group transition-base ${
              action.primary
                ? "bg-brand-primary hover:bg-brand-primary-hover text-on-brand shadow-custom-md"
                : "text-secondary hover:bg-hover-overlay hover:text-brand-primary"
            }`}
          >
            <action.icon className="w-4 h-4 mr-3 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-fs5 fw-500">{action.label}</span>
              <span className={`text-fs6 fw-400 ${
                action.primary ? "text-on-brand/80" : "text-tertiary"
              }`}>
                {action.description}
              </span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
} 