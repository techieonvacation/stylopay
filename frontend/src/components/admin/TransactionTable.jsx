import { ArrowUpRight, ArrowDownRight, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/badge";

const transactionData = [
  {
    type: "income",
    amount: 5420,
    description: "Client Payment - Project Alpha",
    date: "2 hours ago",
    status: "completed",
    category: "Business",
  },
  {
    type: "expense",
    amount: 1250,
    description: "Software Subscription - Adobe Creative",
    date: "5 hours ago",
    status: "completed",
    category: "Tools",
  },
  {
    type: "income",
    amount: 3200,
    description: "Freelance Work - Web Development",
    date: "1 day ago",
    status: "pending",
    category: "Freelance",
  },
  {
    type: "expense",
    amount: 890,
    description: "Office Supplies & Equipment",
    date: "2 days ago",
    status: "completed",
    category: "Office",
  },
  {
    type: "income",
    amount: 7500,
    description: "Monthly Retainer - Client B",
    date: "3 days ago",
    status: "completed",
    category: "Retainer",
  },
];

export default function TransactionTable() {
  return (
    <Card className="bg-surface-primary border-secondary shadow-custom-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-fs2 fw-600 text-primary font-primary">
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-secondary">
              Latest financial activities with advanced filters
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-secondary hover:text-brand-primary hover:bg-hover-overlay"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-secondary hover:text-brand-primary hover:bg-hover-overlay"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactionData.map((transaction, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-secondary rounded-xl hover:bg-hover-overlay transition-all duration-200 border border-secondary group"
            >
              <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-custom-md flex-shrink-0 ${
                    transaction.type === "income"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-red-400 to-pink-500"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="fw-500 text-primary truncate group-hover:text-brand-primary transition-colors">
                    {transaction.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-fs6 text-secondary">{transaction.date}</p>
                    <Badge className="bg-brand-accent text-on-brand border-0 text-fs6">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p
                  className={`text-fs3 fw-600 ${
                    transaction.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {transaction.amount.toLocaleString()}
                </p>
                <Badge
                  variant={transaction.status === "completed" ? "default" : "secondary"}
                  className={`text-fs6 mt-1 ${
                    transaction.status === "completed"
                      ? "bg-green-500 text-white border-0"
                      : "bg-yellow-500 text-white border-0"
                  }`}
                >
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            className="text-brand-primary hover:bg-hover-overlay hover:text-brand-primary-hover"
          >
            Load More Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 