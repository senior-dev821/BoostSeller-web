"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ChartTab from "../common/ChartTab";
import Badge from "../ui/badge/Badge";
// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ResponseTimeCard() {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [categories, setCategories] = useState<string[]>([]);
  const [avgResponseTimes, setAvgResponseTimes] = useState<number[]>([]);
  const [slaCompliances, setSlaCompliances] = useState<number[]>([]);
  const [slaTarget, setSlaTarget] = useState<number>(30); // default fallback
	const [totalAvgResponseTime, setTotalAvgResponseTime] = useState<number>();
	const [totalSlaCompliance, setTotalSlaCompliance] = useState<number>();
	const maxY = Math.max(...avgResponseTimes, slaTarget) + 5; 

	useEffect(() => {
    if (view) {
      fetchResponseTime(view);
    }
  }, [view]);

	const fetchResponseTime = async (view: string) =>{
		try {
      const res = await fetch("/api/admin/statistics/responsetime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          view: view,
				}),
      });

      const data = await res.json();

      setCategories(data.categories || []);
			setAvgResponseTimes(data.avgResponseTimes || []);
			setSlaCompliances(data.slaComplianceRates || []);
			setSlaTarget(data.slaSeconds || 30);
			setTotalAvgResponseTime(data.totalAvgResponseTime || 0);
			setTotalSlaCompliance(data.totalSlaCompliance || 0);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
	};

 const options: ApexOptions = {
		chart: {
			type: "line",
			height: 350,
			fontFamily: "Outfit, sans-serif",
			toolbar: { show: false },
			animations: { enabled: true },
		},
		colors: ["#465FFF", "#00C49F"],
		stroke: {
			curve: "smooth",
			width: [2, 2],
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			shared: true,
			intersect: false,
			y: {
				formatter: (value, { seriesIndex }) =>
					seriesIndex === 0 ? `${value}s` : `${value}%`,
			},
		},
		xaxis: {
			type: "category",
			categories,
			axisBorder: { show: false },
			axisTicks: { show: false },
			position: "bottom",
			offsetX: 0,
			labels: {
				style: {
					fontSize: "12px",
					colors: ["#6B7280"],
				},
			},
		},
		yaxis: [
			{
				title: {
					text: "Avg Response Time (s)",
				},
				min: 0,
				max: maxY,
				labels: {
					formatter: (val) => `${val}s`,
					style: { colors: ["#465FFF"] },
				},
			},
			{
				opposite: true,
				title: {
					text: "SLA Compliance (%)",
				},
				min: 0,
				max: 100,
				labels: {
					formatter: (val) => `${val}%`,
					style: { colors: ["#00C49F"] },
				},
			},
		],
		annotations: {
			yaxis: [
				{
					y: slaTarget,
					yAxisIndex: 0,
					borderColor: "#FF4560",
					label: {
						borderColor: "#FF4560",
						style: {
							color: "#fff",
							background: "#FF4560",
						},
						text: `SLA Target (${slaTarget}s)`,
					},
				},
			],
		},
		grid: {
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
		},
		legend: { show: false },
	};

  const series = [
    {
      name: "Avg Response Time",
      type: "line",
      data: avgResponseTimes,
    },
    {
      name: "SLA Compliance",
      type: "line",
      data: slaCompliances,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
			<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
				Response Time
			</h3>
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full flex gap-2">
					<Badge
						size="md"
						color={"primary"}
					>
						Total Avg Res Time : {totalAvgResponseTime} s
					</Badge>
					<Badge
						size="md"
						color={"info"}
					>
						Total SLA Compliance :{totalSlaCompliance} %
					</Badge>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab selected={view} onChange={setView} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
