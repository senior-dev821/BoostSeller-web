"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { useState, useEffect } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConversionRateCard from "./ConversionRateCard";
import { GroupIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function LeadsCountChart() {
  const stageLabels = ["New", "In-Progress", "Processed", "Lost", "Converted"];

  // Date range state
  const [startDate, setStartDate] = useState<Date | null>(new Date());
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
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        }),
      });

      const data = await res.json();

      setSeries([
        {
          name: "Leads",
          data: data.leadAnalysis,
        },
      ]);

      setTotalLeads(data.total);
      console.log(data);
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
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="MMM dd, yyyy"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
            placeholderText="Start Date"
          />
          <span className="text-gray-500">to</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ?? undefined}
            dateFormat="MMM dd, yyyy"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
            placeholderText="End Date"
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex justify-between">
        <div className="w-full  overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[850px] xl:min-w-full pl-4">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={200}
            />
          </div>
        </div>
        <div className="flex items-center justify-center border bg-gray-100 shadow-default rounded-2xl pb-2 dark:bg-gray-900 md:p-6 gap-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div>
            <p className="text-md text-gray-500 text-center dark:text-gray-400">
              Total Leads
            </p>
            <p className="mt-2 font-bold text-gray-800 text-center text-title-sm dark:text-white/90">
              {totalLeads}
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Rates Section */}
      <div className="grid gap-4 mt-6 mb-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <ConversionRateCard
          key={`ntp-${newToProgressRate}`}
          from={"New"}
          to={"In-Progress"}
          rate={newToProgressRate} />
        <ConversionRateCard
          key={`ptp-${progressToProcessedRate}`}
          from={"In-Progress"}
          to={"Processed"}
          rate={progressToProcessedRate} />
        <ConversionRateCard
          key={`ptc-${processedToConvertedRate}`}
          from={"Processed"}
          to={"Converted"}
          rate={processedToConvertedRate} />
        <ConversionRateCard
          key={`ptl-${processedToLostRate}`}
          from={"Processed"}
          to={"Lost"}
          rate={processedToLostRate} />
      </div>
    </div>
  );
}
