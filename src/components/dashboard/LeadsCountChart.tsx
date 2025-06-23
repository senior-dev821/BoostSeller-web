"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import DatePicker from "@/components/form/date-picker"; // 👈 Your custom component
import ConversionRateCard from "./ConversionRateCard";
import { GroupIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function LeadsCountChart() {
  const stageLabels = ["New", "In-Progress", "Processed", "Lost", "Converted"];

// Date range state
  const [startDate, setStartDate] = useState<Date>(()=> {
    const today = new Date()
    return new Date(today.setDate(today.getDate() - 7))
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [newToProgressRate, setNewToProgressRate] = useState(0);
  const [progressToProcessedRate, setProgressToProcessedRate] = useState(0);
  const [processedToConvertedRate, setProcessedToConvertedRate] = useState(0);
  const [processedToLostRate, setProcessedToLostRate] = useState(0);
  const [series, setSeries] = useState([
    {
      name: "Leads",
      data: [0, 0, 0, 0, 0], // default values
    },
  ]);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      fetchLeadsData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const fetchLeadsData = async (start: Date, end: Date) => {
    try {
      const res = await fetch("/api/admin/statistics/leadcount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
					startDate: new Date(start.setHours(0, 0, 0, 0)).toISOString(),  // ⬅️ Start of local day
					endDate: new Date(end.setHours(23, 59, 59, 999)).toISOString(), // ⬅️ End of local day
				}),				
      });

      const data = await res.json();
      console.log(data);
      setSeries([{ name: "Leads", data: data.leadAnalysis }]);
      setTotalLeads(data.total);
      setNewToProgressRate(data.newToProgressRate);
      setProgressToProcessedRate(data.progressToProcessedRate);
      setProcessedToConvertedRate(data.processedToConvertedRate);
      setProcessedToLostRate(data.processedToLostRate);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: stageLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Leads
        </h3>
				{/* Date Picker */}
        <div className="flex items-center gap-3 mb-4">
          <DatePicker
            id="start-date"
            label="From"
            mode="single"
            defaultDate={startDate ?? undefined}
            onChange={([date]) => setStartDate(date as Date)}
            placeholder="Start Date"
          />

          <DatePicker
            id="end-date"
            label="To"
            mode="single"
            defaultDate={endDate ?? undefined}
            onChange={([date]) => setEndDate(date as Date)}
            placeholder="End Date"
          />
        </div>
      </div>

			{/* Heatmap Section */}
      <div className="flex justify-between">
        <div className="w-full  overflow-x-auto custom-scrollbar gap-2">
          <div className="-ml-5 min-w-[850px] xl:min-w-full pl-4">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={200}
            />
          </div>
        </div>
        <Card className="bg-muted p-4 rounded-lg shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-700">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="text-center">
            <p className="text-md text-gray-500 dark:text-gray-400">
              Total Leads
            </p>
            <p className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalLeads}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 mb-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <ConversionRateCard key={`npr-${newToProgressRate}`} from="New" to="In-Progress" rate={newToProgressRate} />
        <ConversionRateCard key={`ipr-${progressToProcessedRate}`} from="In-Progress" to="Processed" rate={progressToProcessedRate} />
        <ConversionRateCard key={`pcr-${processedToConvertedRate}`} from="Processed" to="Converted" rate={processedToConvertedRate} />
        <ConversionRateCard key={`plr-${processedToLostRate}`} from="Processed" to="Lost" rate={processedToLostRate} />
      </div>
    </div>
  );
}
