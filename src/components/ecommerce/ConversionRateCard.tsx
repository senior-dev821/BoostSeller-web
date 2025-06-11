"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ConversionRateCardProps {
  from: string;
  to: string;
  rate: number;
}

export default function ConversionRateCard({ from, to, rate }: ConversionRateCardProps) {
  const series = [rate];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 180,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "60%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "90%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "20px",
            fontWeight: "300",
            offsetY: -10,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  return (
		<div className="px-1 pt-1 border bg-gray-100 shadow-default rounded-2xl pb-2 dark:bg-gray-900">
			<ReactApexChart options={options} series={series} type="radialBar" height={150} />
			<p className="mt-2 w-full max-w-[120px] text-center text-sm text-gray-500 sm:text-base">
				{from} to {to}
			</p>
		</div>
  );
}
