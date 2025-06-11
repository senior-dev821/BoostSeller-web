"use client"

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Pagination from "@/components/form/form-elements/Pagination";

interface Lead {
  id: number;
  name: string;
  registerId: string;
  phoneNumber: string;
  status: string;
  assignedName: string;
  assignedAvatarPath: string;
  acceptedName: string;
  acceptedAvatarPath: string;
  isReturn: boolean;
  interest: {
    id: number;
    name: string;
  }
  hostess: {
    name: string;
    user: {
      name: string;
      avatarPath: string;
      role: string;
    }
  }
  additionalInfo: additionalInfo[];

}

interface additionalInfo {
  type: string;
  label: string;
  value: string;
}

interface Interest {
  id: number;
  name: string;
}


export default function LeadForm() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetch("/api/admin/lead")
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to fetch leads: ${errText}`);
        }
        return res.json();
      })
      .then((data) => setLeads(data))
      .catch((err) => {
        console.error("Error loading leads:", err);
      });
  }, []);

  useEffect(() => {
    fetch("/api/admin/setting/interest")
      .then((res) => res.json())
      .then((data) => setInterests(data));
  }, []);

  function getBudgetFromLead(lead: Lead): string | undefined {
    return lead.additionalInfo.find(
      info => info.label === "Budget" && info.type === "currency"
    )?.value;
  }

  const totalPages = Math.ceil(leads.length / pageSize);
  const paginatedPerformers = leads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">


          <div className="pt-4 mb-4 px-4 flex justify-end">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Status :
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option key={0} value="All">All</option>
                  <option key={1} value="assigned">Assigned</option>
                  <option key={2}value="progress">Progress</option>
                  <option key={3} value="completed">Completed</option>
                  <option key={4} value="closed">Closed</option>
                  <option key={5} value="pendding">All Skipped</option>
                  <option key={6} value="returned">Returned</option>

                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Group:
                </label>
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option value={0}>All</option>
                  {interests.map((interest) => (
                    <option key={interest.id} value={interest.id}>
                      {interest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Interest
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  PhoneNumber
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Added By
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Assigned To
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Accepted By
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Budget
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedPerformers
                .filter((lead) => {
                  // if (selectedInterest === 0) return true;
                  // return lead.interest.id === selectedInterest;
                  const interestMatch =
                    selectedInterest === 0 || lead.interest.id === selectedInterest;

                  const statusMatch = (() => {
                    if (selectedStatus === "All") return true;
                    if (selectedStatus === "progress")
                      return !["assigned", "completed", "closed", "pendding"].includes(lead.status);
                    if (selectedStatus === "returned")
                      return lead.isReturn === true;
                    return lead.status === selectedStatus;
                  })();

                  return interestMatch && statusMatch;
                })

                .map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      {lead.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {lead.interest.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {lead.phoneNumber}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src={
                              lead.hostess.user.avatarPath
                                ? `${nextServerUrl}${lead.hostess.user.avatarPath}`
                                : "/images/user/user-04.jpg"}
                            alt={lead.name}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {lead.hostess.user.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {lead.hostess.user.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      {lead.assignedName !== ""
                        ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <Image
                                width={40}
                                height={40}
                                src={
                                  lead.assignedAvatarPath
                                    ? `${nextServerUrl}${lead.assignedAvatarPath}`
                                    : "/images/user/user-04.jpg"
                                }
                                alt={lead.assignedName}
                              />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {lead.assignedName}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                {"performer"}
                              </span>
                            </div>
                          </div>
                        )
                        : ("Not Yet.")
                      }
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      {lead.acceptedName !== ""
                        ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <Image
                                width={40}
                                height={40}
                                src={lead.acceptedAvatarPath || "/images/user/user-01.jpg"}
                                alt={lead.acceptedName}
                              />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {lead.acceptedName}
                              </span>
                              <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                {"performer"}
                              </span>
                            </div>
                          </div>
                        )
                        : ("Not Yet.")
                      }

                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={
                          lead.status === "completed"
                            ? "success"
                            : lead.status === "closed"
                              ? "error"
                              : lead.status === "assigned"
                                ? "info"
                                : lead.status === "pendding"
                                  ? "dark"
                                  : "primary"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm text-center dark:text-gray-400">
                      {getBudgetFromLead(lead) ?? "Not specified"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>


        </div>
      </div>
      {/* ✅ Pagination */}
      {leads.length > pageSize && (
        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
