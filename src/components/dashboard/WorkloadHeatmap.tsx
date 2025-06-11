// components/dashboard/WorkloadHeatmap.tsx
"use client"

import { useEffect, useState } from "react"
import { format, addDays } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Card } from "@/components/ui/card"
import Button from "@/components/ui/button/Button"
import { Download, AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

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
    return addDays(today, -7)
  })
  const [toDate, setToDate] = useState<Date>(() => new Date())
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

  const colorScale = [
    "bg-gray-100 ",
    "bg-gray-200",
    "bg-gray-300 ",
    "bg-gray-400 ",
    "bg-gray-500 ",
    "bg-gray-600 ",
    "bg-gray-700 ",
  ]

  const flatten = heatmapData.flatMap((d) => d.hours)
  const maxVal = Math.max(...flatten)
  const minVal = Math.min(...flatten)
  const range = maxVal - minVal || 1
  const scale = range / colorScale.length

  const getColor = (val: number) => {
    const index = Math.floor((val - minVal) / scale)
    return colorScale[Math.min(index, colorScale.length - 1)]
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 gap-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Workload & Traffic</h2>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Date Pickers */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground">From</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => date && setFromDate(date)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">To</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => date && setToDate(date)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto mt-6 mb-6">
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
                <td className="text-sm font-medium pr-2">
                  {format(new Date(row.date), "MM:dd")}
                </td>
                {row.hours.map((val: number, idx: number) => (
                  <td key={idx} className="w-6 h-6">
                    <div
                      className={`w-4 h-4 mx-auto rounded ${getColor(val)}`}
                      title={val.toString()}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        <Card className="bg-muted p-4 rounded-lg shadow-sm flex flex-col justify-between ">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Team Status</h3>
            <ul className="text-sm space-y-1">
              {groupStatus.map((p, i) => (
                <li key={i} className="flex justify-between">
                  <span>{p.name}</span>
                  <span
                    className={`font-medium ${
                      !p.hasAvailablePerformer ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {p.hasAvailablePerformer ? "Available" : "Unavailable"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push("/performer")}
          >
            View Performers <ArrowRight className="ml-2 w-4 h-4 " />
          </Button>
        </Card>

        <Card className="bg-muted p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              At-Risk Leads
            </h3>
            <p className="text-sm mb-1">Skipped: {riskCounts.skipped}</p>
            <p className="text-sm">Unresponsive: {riskCounts.unresponsive}</p>
          </div>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push("/leads")}
          >
            View Leads <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  )
}
