// components/LeadFunnelReport.tsx
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const data = [
  { stage: "New", count: 120 },
  { stage: "In Progress", count: 90 },
  { stage: "Processed", count: 60 },
  { stage: "Lost", count: 20 },
  { stage: "Converted", count: 40 },
];

export default function LeadFunnelReport() {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Funnel Report</h2>
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">Total Leads: {total}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-1">
        {data.map((d, i) => {
          const prev = data[i - 1]?.count || d.count;
          const rate = i === 0 ? 100 : ((d.count / prev) * 100).toFixed(1);
          return (
            <p key={i} className="text-sm text-muted-foreground">
              {i === 0 ? "Initial" : `${data[i - 1].stage} → ${d.stage}`}: {rate}% conversion
            </p>
          );
        })}
      </div>
    </Card>
  );
}
