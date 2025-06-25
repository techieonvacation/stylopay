import { DollarSign, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const statsData = [
  {
    title: "Total Revenue",
    value: "$125,430",
    change: "+25.3%",
    period: "from last month",
    icon: DollarSign,
    trend: "up",
    iconBg: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  {
    title: "Active Users", 
    value: "8,549",
    change: "+12.5%",
    period: "from last week",
    icon: Users,
    trend: "up",
    iconBg: "bg-gradient-to-r from-purple-400 to-indigo-500",
  },
  {
    title: "Transactions",
    value: "23,456",
    change: "+8.2%",
    period: "from yesterday",
    icon: CreditCard,
    trend: "up",
    iconBg: "bg-gradient-to-r from-orange-400 to-red-500",
  },
  {
    title: "Growth Rate",
    value: "+89.2%",
    change: "+15.3%",
    period: "from last quarter",
    icon: TrendingUp,
    trend: "up",
    iconBg: "bg-gradient-to-r from-cyan-400 to-blue-500",
  },
];

export default function AdminStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="bg-surface-primary border-secondary shadow-custom-md hover:shadow-custom-lg transition-all duration-300 hover:transform hover:-translate-y-1"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-fs6 fw-400 text-secondary">{stat.title}</CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-fs1 lg:text-fs2 fw-600 text-primary font-primary">
                {stat.value}
              </div>
              <div className={`p-3 ${stat.iconBg} rounded-xl shadow-custom-md`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-fs6">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                {stat.change}
              </span>
              <span className="text-secondary ml-1">{stat.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 