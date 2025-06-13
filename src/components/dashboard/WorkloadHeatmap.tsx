// components/dashboard/WorkloadHeatmap.tsx
"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import Button from "@/components/ui/button/Button"
import { AlertCircle } from "lucide-react"
import DatePicker from "@/components/form/date-picker" // your custom flatpickr-based component
import Badge from "../ui/badge/Badge";
import { MoreDotIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type HeatmapRow = {
  date: string // e.g. "2025-06-11"
  hours: number[] // 12 elements for each hour's count
}

type GroupStatus = {
  name: string
  hasAvailablePerformer: boolean
}

type RiskCounts = {
  skipped: number
  unresponsive: number
}

export default function WorkloadHeatmap() {
  const [fromDate, setFromDate] = useState<Date>(() => {
    const today = new Date()
    return new Date(today.setDate(today.getDate() - 7))
  })
  const [toDate, setToDate] = useState<Date>(new Date())
  const [heatmapData, setHeatmapData] = useState<HeatmapRow[]>([])
  const [groupStatus, setGroupStatus] = useState<GroupStatus[]>([])
  const [riskCounts, setRiskCounts] = useState<RiskCounts>({ skipped: 0, unresponsive: 0 })

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      })
      const res = await fetch(`/api/admin/statistics/worktraffic?${params}`)
      const data = await res.json()
      setHeatmapData(data.heatmap)
      setGroupStatus(data.groupStatus)
      setRiskCounts(data.riskCounts)
    }
    fetchData()
  }, [fromDate, toDate])

	// Get flat list of all hour values
	const allValues = heatmapData.flatMap((row) => row.hours)
	const min = Math.min(...allValues)
	const max = Math.max(...allValues)
	const rangeCount = 7
  const rangeSize = Math.max(1, Math.ceil((max - min + 1) / rangeCount))

	// Generate 7 ranges with equal size
	const brandColors = [
    "#eee9ff", // 100
    "#d8ccff", // 200
    "#b8a8ff", // 300
    "#9380ff", // 400
    "#6b5eff", // 500
    "#4a3dd8", // 600
    "#36279e", // 700
  ]
	const colorRanges = Array.from({ length: rangeCount }, (_, i) => {
    const from = min + i * rangeSize
    const to = from + rangeSize - 1
    return {
      from,
      to,
      color: brandColors[i],
    }
  })

  const series = heatmapData.map((row) => ({
    name: format(parseISO(row.date), "dd/MM"),
    data: row.hours.map((val, idx) => ({
			x: `${idx.toString().padStart(2, "0")}:00`, // 00:00–23:00
			y: val,
		})),
  }))

  const chartOptions: ApexCharts.ApexOptions = {
		chart: {
			type: "heatmap",
			toolbar: { show: false },
			background: "transparent"
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			title: { text: "Hour" },
			labels: {
				show: true,
				rotate: -45,
				formatter: (val) => val, // keeps full 24-hour format
			},
		},		
		yaxis: {
			title: { text: "Date" },
		},
		plotOptions: {
			heatmap: {
				colorScale: {
					ranges: colorRanges,
				},
			},
		},
	}

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 gap-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Workload & Traffic</h2>
        {/* <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> bg-white
          Export
        </Button> */}
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <DatePicker
          id="from-date"
          label="From"
          placeholder="Select start date"
          defaultDate={fromDate}
          onChange={(selectedDates) => {
            const d = selectedDates[0] as Date
            if (d) setFromDate(d)
          }}
        />
        <DatePicker
          id="to-date"
          label="To"
          placeholder="Select end date"
          defaultDate={toDate}
          onChange={(selectedDates) => {
            const d = selectedDates[0] as Date
            if (d) setToDate(d)
          }}
        />
      </div>

      {/* Heatmap */}
			<div className="mt-4 mb-8">
        <ReactApexChart
          type="heatmap"
          height={320}
          options={chartOptions}
          series={series}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        <Card className="bg-muted p-4 rounded-lg shadow-sm flex flex-col justify-between ">
          <div>
						<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
							<h3 className="text-sm font-medium text-muted-foreground mb-2">Team Status</h3>
							<Button
								size="icon"
								variant="outline"
								className="w-8 h-8 p-0"
								onClick={() => router.push("/performer")}
							>
								<MoreDotIcon className="fill-gray-500 dark:fill-gray-400" />
							</Button>
						</div>
            <ul className="text-sm space-y-1">
              {groupStatus.map((p, i) => (
                <li key={i} className="flex justify-between">
                  <span>{p.name}</span>
									<Badge key={i} size="sm" color={`${
                      !p.hasAvailablePerformer ? "error" : "success"
                    }`}>
									{p.hasAvailablePerformer ? "Available" : "Unavailable"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="bg-muted p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
						<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
							<h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
								<AlertCircle className="w-4 h-4 text-yellow-500" />
								At-Risk Leads
							</h3>
							<Button size="icon"
								variant="outline"
								className="w-8 h-8 p-0"
								onClick={() => router.push("/leads")}
							>
								<MoreDotIcon className="fill-gray-500 dark:fill-gray-400" />
							</Button>
						</div>
						<div className="space-y-1">
							<Badge size="sm" color={`${riskCounts.skipped != 0 ? "error" : "success"
								}`}>
							All Skipped Leads: {riskCounts.skipped}
							</Badge>
							<Badge size="sm" color={`${riskCounts.unresponsive != 0 ? "error" : "success"
								}`}>
							 Unresponsive Leads: {riskCounts.unresponsive}
							</Badge>
						</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
