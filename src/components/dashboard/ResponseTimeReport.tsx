// components/ResponseTimeReport.tsx
import { Card } from "@/components/ui/card";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const trendData = [
  { date: "Mon", avgResponseSec: 110 },
  { date: "Tue", avgResponseSec: 85 },
  { date: "Wed", avgResponseSec: 97 },
  { date: "Thu", avgResponseSec: 150 },
  { date: "Fri", avgResponseSec: 80 },
  { date: "Sat", avgResponseSec: 120 },
];

const performers = [
  { name: "Alex Moyo", avgResponse: "2m 15s" },
  { name: "Brenda Chikomo", avgResponse: "1m 58s" },
];

export default function ResponseTimeReport() {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Response Time Report</h2>
        <DateRangePicker />
      </div>

      {/* Trend Line Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis unit="s" />
            <Tooltip />
            <Line type="monotone" dataKey="avgResponseSec" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SLA + Individual Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted p-4 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">SLA Target</h3>
          <p className="text-lg font-semibold">2 minutes</p>
          <p className="text-sm text-muted-foreground">Avg for selected period: <strong>1m 52s</strong></p>
        </div>

        <div className="bg-muted p-4 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Performer Breakdown</h3>
          <ul className="space-y-1 text-sm">
            {performers.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-medium">{p.avgResponse}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
