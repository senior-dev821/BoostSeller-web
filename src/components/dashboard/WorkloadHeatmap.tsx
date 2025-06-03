// components/WorkloadHeatmap.tsx
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button/Button";
import { Download, AlertCircle } from "lucide-react";

const heatmapData = [
  // Each row is a day of week
  { day: "Mon", hours: [2, 4, 6, 3, 1, 0, 0, 0, 1, 4, 6, 2] },
  { day: "Tue", hours: [1, 3, 7, 5, 3, 1, 0, 0, 2, 6, 4, 1] },
  { day: "Wed", hours: [0, 1, 5, 6, 7, 2, 0, 1, 3, 4, 2, 1] },
  { day: "Thu", hours: [1, 4, 6, 2, 0, 1, 0, 0, 2, 5, 3, 1] },
  { day: "Fri", hours: [2, 5, 4, 3, 1, 0, 1, 1, 4, 7, 6, 2] },
  { day: "Sat", hours: [0, 1, 2, 1, 0, 0, 0, 1, 2, 3, 1, 0] },
];

const performers = [
  { name: "Alex Moyo", status: "Available" },
  { name: "Brenda Chikomo", status: "Overloaded" },
];

const atRiskLeads = 4;

export default function WorkloadHeatmap() {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workload & Traffic Heatmap</h2>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="px-2 py-1 text-left">Day</th>
              {[...Array(12).keys()].map((h) => (
                <th key={h} className="px-1.5 py-1">{`${h + 8}:00`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, i) => (
              <tr key={i}>
                <td className="text-sm font-medium pr-2">{row.day}</td>
                {row.hours.map((val, idx) => (
                  <td key={idx} className="w-6 h-6">
                      <div className={`w-4 h-4 mx-auto rounded bg-brand-${val%10}00`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Staff Status and Risk Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Status</h3>
          <ul className="text-sm space-y-1">
            {performers.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span
                  className={`font-medium ${
                    p.status === "Overloaded" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-muted p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            At-Risk Leads
          </h3>
          <p className="text-lg font-semibold">{atRiskLeads}</p>
          <p className="text-xs text-muted-foreground">No response in last 24 hours</p>
        </div>
      </div>
    </Card>
  );
}
