import { Filter, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/Button";

const chartData = [65, 45, 80, 60, 90, 75, 95, 70, 85, 55, 75, 88];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminChart() {
  return (
    <Card className="lg:col-span-2 bg-surface-primary border-secondary shadow-custom-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-fs2 fw-600 text-primary font-primary">
              Revenue Analytics
            </CardTitle>
            <CardDescription className="text-secondary">
              Advanced performance metrics and trends
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
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 lg:h-80 relative">
          {/* Chart Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent rounded-lg"></div>
          
          {/* Chart Bars */}
          <div className="h-full flex items-end justify-between p-4 lg:p-6 space-x-1 lg:space-x-3">
            {chartData.map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div
                  className="w-full bg-brand-primary rounded-t-lg transition-all duration-500 hover:bg-brand-primary-hover cursor-pointer shadow-custom-sm hover:shadow-custom-md relative overflow-hidden"
                  style={{ height: `${height}%` }}
                >
                  {/* Bar Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-accent to-brand-secondary opacity-80"></div>
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-2 py-1 rounded text-fs6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${(height * 1000).toLocaleString()}
                  </div>
                </div>
                <span className="text-fs6 text-secondary mt-2 group-hover:text-brand-primary transition-colors">
                  {months[index]}
                </span>
              </div>
            ))}
          </div>

          {/* Chart Labels */}
          <div className="absolute top-4 left-4 lg:left-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
                <span className="text-fs6 text-secondary">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-accent rounded-full"></div>
                <span className="text-fs6 text-secondary">Growth</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 