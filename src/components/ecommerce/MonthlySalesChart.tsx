// "use client";
// import { ApexOptions } from "apexcharts";
// import dynamic from "next/dynamic";
// import { MoreDotIcon } from "@/icons";
// import { DropdownItem } from "../ui/dropdown/DropdownItem";
// import { useState } from "react";
// import { Dropdown } from "../ui/dropdown/Dropdown";

// // Dynamically import the ReactApexChart component
// const ReactApexChart = dynamic(() => import("react-apexcharts"), {
//   ssr: false,
// });

// export default function MonthlySalesChart() {
//   const stageLabels = ["New", "In Progress", "Processed", "Lost", "Converted"];
//   const series = [
//     {
//       name: "Leads",
//       data: [385, 302, 298, 201, 112], // Adjust as needed
//     },
//   ];

//   const total = series[0].data.reduce((sum, value) => sum + value, 0);

//   const conversionRates = series[0].data.slice(0, -1).map((value, index) => {
//     const next = series[0].data[index + 1];
//     const rate = value > 0 ? ((next / value) * 100).toFixed(1) : "0.0";
//     return {
//       from: stageLabels[index],
//       to: stageLabels[index + 1],
//       rate: parseFloat(rate),
//     };
//   });

//   const options: ApexOptions = {
//     colors: ["#465fff"],
//     chart: {
//       fontFamily: "Outfit, sans-serif",
//       type: "bar",
//       height: 180,
//       toolbar: {
//         show: false,
//       },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "39%",
//         borderRadius: 5,
//         borderRadiusApplication: "end",
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     stroke: {
//       show: true,
//       width: 4,
//       colors: ["transparent"],
//     },
//     xaxis: {
//       categories: stageLabels,
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },
//     legend: {
//       show: true,
//       position: "top",
//       horizontalAlign: "left",
//       fontFamily: "Outfit",
//     },
//     yaxis: { title: { text: undefined } },
//     grid: { yaxis: { lines: { show: true } } },
//     fill: { opacity: 1 },
//     tooltip: {
//       x: { show: false },
//       y: {
//         formatter: (val: number) => `${val}`,
//       },
//     },
//   };

//   const [isOpen, setIsOpen] = useState(false);
//   function toggleDropdown() {
//     setIsOpen(!isOpen);
//   }
//   function closeDropdown() {
//     setIsOpen(false);
//   }

//   return (
//     <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
//           Total Leads: {total}
//         </h3>

//         <div className="relative inline-block">
//           <button onClick={toggleDropdown} className="dropdown-toggle">
//             <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
//           </button>
//           <Dropdown
//             isOpen={isOpen}
//             onClose={closeDropdown}
//             className="w-40 p-2"
//           >
//             <DropdownItem
//               onItemClick={closeDropdown}
//               className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
//             >
//               View More
//             </DropdownItem>
//             <DropdownItem
//               onItemClick={closeDropdown}
//               className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
//             >
//               Delete
//             </DropdownItem>
//           </Dropdown>
//         </div>
//       </div>

//       <div className="mt-6 flex flex-col gap-6 md:flex-row">
// 			{/* Chart Section */}
// 			<div className="w-full md:w-2/3 overflow-x-auto custom-scrollbar">
// 				<div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
// 					<ReactApexChart
// 						options={options}
// 						series={series}
// 						type="bar"
// 						height={200}
// 					/>
// 				</div>
// 			</div>

// 			{/* Conversion Rates Section */}
// 			<div className="w-full md:w-1/3 space-y-4">
// 				{conversionRates.map((item, idx) => (
// 					<div key={idx}>
// 						<div className="mb-1 flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
// 							<span>
// 								{item.from} → {item.to}
// 							</span>
// 							<span>{item.rate}%</span>
// 						</div>
// 						<div className="relative h-3 w-full rounded-sm bg-gray-200 dark:bg-gray-800">
// 							<div
// 								className="absolute left-0 top-0 h-full rounded-sm bg-brand-500 transition-all duration-300"
// 								style={{ width: `${item.rate}%` }}
// 							></div>
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</div>
//     </div>
//   );
// }


"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const stageLabels = ["New", "In Progress", "Processed", "Lost", "Converted"];

  // Date range state
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Example data — in practice, fetch based on dates
  const series = [
    {
      name: "Leads",
      data: [385, 302, 298, 201, 112], // Ideally fetched based on date range
    },
  ];

  const total = series[0].data.reduce((sum, value) => sum + value, 0);

  const conversionRates = series[0].data.slice(0, -1).map((value, index) => {
    const next = series[0].data[index + 1];
    const rate = value > 0 ? ((next / value) * 100).toFixed(1) : "0.0";
    return {
      from: stageLabels[index],
      to: stageLabels[index + 1],
      rate: parseFloat(rate),
    };
  });

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
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

  // const [isOpen, setIsOpen] = useState(false);
  // function toggleDropdown() {
  //   setIsOpen(!isOpen);
  // }
  // function closeDropdown() {
  //   setIsOpen(false);
  // }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Total Leads: {total}
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

      

      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        {/* Chart Section */}
        <div className="w-full md:w-2/3 overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={200}
            />
          </div>
        </div>

        {/* Conversion Rates Section */}
        <div className="w-full md:w-1/3 space-y-4">
          {conversionRates.map((item, idx) => (
            <div key={idx}>
              <div className="mb-1 flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                <span>
                  {item.from} → {item.to}
                </span>
                <span>{item.rate}%</span>
              </div>
              <div className="relative h-3 w-full rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 h-full rounded-sm bg-brand-500 transition-all duration-300"
                  style={{ width: `${item.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
