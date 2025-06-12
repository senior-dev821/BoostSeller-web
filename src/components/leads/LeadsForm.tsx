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
import {
  User, Sparkles, DollarSign, CheckCircle, CircleDot, CheckCircle2, XCircle, CircleDashed, Clock, Workflow
} from "lucide-react";
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
  stageId: number,
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
  stages: Stage[],

}

interface Stage {
  id: number;
  name: string;
  description: string;
  sequence: number;
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
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
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

  const handleRowClick = (lead: Lead) => {
    setShowInfoDrawer(true);
    setSelectedLead(lead);
  }


  const filteredLeads = leads.filter((lead) => {
    const interestMatch =
      selectedInterest === 0 || lead.interest.id === selectedInterest;

    const statusMatch = (() => {
      if (selectedStatus === "All") return true;
      if (selectedStatus === "progress")
        return !["assigned", "completed", "closed", "pendding"].includes(lead.status);
      if (selectedStatus === "returned") return lead.isReturn === true;
      return lead.status === selectedStatus;
    })();

    return interestMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedInterest, selectedStatus]);

  const getStageStatus = (index: number, currentStageIndex: number, isClosed: boolean, isLast: boolean) => {
    if (isClosed && index === currentStageIndex) return "closed";
    if (isLast && index === currentStageIndex) return "completed";
    if (index < currentStageIndex) return "passed";
    if (index === currentStageIndex) return "progress";
    return "upcoming";
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4" style={{ color: 'blue'}}/>;
      case "progress":
        return <CircleDashed className="w-4 h-4" style={{ color: 'indigo'}} />;
      case "closed":
        return <XCircle className="w-4 h-4" style={{ color: 'red'}} />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'green'}} />;
      case "upcoming":
        return <Clock className="w-5 h-5" style={{ color: 'purple'}} />;
      default:
        return <CircleDot className="text-gray-400 w-4 h-4" />;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {showInfoDrawer && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowInfoDrawer(false)}
            />
          )}
          {showInfoDrawer && selectedLead && (
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Lead Details
                </h4>
                <button
                  onClick={() => setShowInfoDrawer(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto h-full max-h-screen">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 overflow-hidden rounded-full">
                    <Image
                      width={64}
                      height={64}
                      src="/images/user/user-01.jpg"
                      alt={selectedLead.name}
                    />

                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedLead.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLead.phoneNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow w-full sm:w-auto">
                    <Sparkles className="text-blue-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">Interest</div>
                      <div className="text-center">{selectedLead.interest.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow w-full sm:w-auto">
                    <CheckCircle className="text-yellow-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">Status</div>
                      <div className="text-center">
                        {selectedLead.isReturn && (
                          <Badge size="sm" color="warning">
                            retrun
                          </Badge>
                        )}
                        <Badge
                          size="sm"
                          color={
                            selectedLead.status === "completed"
                              ? "success"
                              : selectedLead.status === "closed"
                                ? "error"
                                : selectedLead.status === "assigned"
                                  ? "info"
                                  : selectedLead.status === "pendding"
                                    ? "dark"
                                    : "primary"
                          }
                        >
                          {selectedLead.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                    <User className="text-blue-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">AddedBy</div>
                      <div>{selectedLead.hostess.user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                    <User className="text-blue-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">AssignedTo</div>
                      <div>{selectedLead.assignedName !== "" ? selectedLead.assignedName : "Not assigned"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                    <User className="text-blue-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">AcceptedBy</div>
                      <div>{selectedLead.acceptedName !== "" ? selectedLead.acceptedName : "Not accepted"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                    <DollarSign className="text-green-400 w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium text-gray-400">Budget</div>
                      <div>{getBudgetFromLead(selectedLead)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-full mt-4">
                  <div className="p-4 rounded-lg bg-gray-800 shadow border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <Workflow className="text-green-400 w-5 h-5" />
                      <h5 className="text-md font-semibold text-white">Sales Stage Timeline</h5>

                    </div>
                    {
                      selectedLead.stages.length === 0
                        ? (
                          <div className="flex-1 text-center pr-2 text-sm mb-10 text-red-500 font-semibold">
                            There are no sales stages for the interest
                          </div>
                        )
                        : selectedLead.status === 'pendding'
                          ? (
                            <div className="flex-1 text-center pr-2 text-sm mb-10 text-red-500 font-semibold">
                              Lead is all skipped
                            </div>
                          ) : selectedLead.status === 'closed' && selectedLead.stageId === 0
                            ? (
                              <div className="flex-1 text-center pr-2 text-sm mb-10 text-red-500 font-semibold">
                                Lead is all skipped and Closed
                              </div>
                            )
                            : (
                              <div className="relative pl-8">
                                {selectedLead.stages.map((stage, index) => {
                                  const isClosed = selectedLead.status === "closed";
                                  const isLast = index === selectedLead.stages.length - 1;
                                  const currentStageIndex = selectedLead.stages.findIndex(s => s.id === selectedLead.stageId);
                                  const status = getStageStatus(index, currentStageIndex, isClosed, isLast);
                                  

                                  return (
                                    <div key={stage.id} className="relative min-h-[60px]">
                                      {/* Vertical Line */}
                                      {!isLast && (
                                        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-[60px] w-px bg-green-500 z-0" />
                                      )}

                                      {/* Row: name - icon - status */}
                                      <div className="flex items-center justify-between gap-2 mb-6">
                                        {/* Name */}
                                        <div className="flex-1 text-right pr-2 text-sm text-gray-400">
                                          {stage.name}
                                        </div>

                                        {/* Circle Icon */}
                                        <div className="w-6 h-6 flex items-center justify-center">
                                          {getStageIcon(status)}
                                        </div>

                                        {/* Status */}
                                        <div className="flex-1 pl-2 text-left">
                                          <Badge
                                            size="sm"
                                            color={
                                              status === "passed"
                                                ? "info"
                                                : status === "progress"
                                                  ? "primary"
                                                  : status === "closed"
                                                    ? "error"
                                                      : status === "completed"
                                                      ? "success"
                                                        : status === "upcoming"
                                                        ? "warning"
                                                        : "light"
                                            }
                                          >
                                            {status}
                                          </Badge>
                                        </div>

                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )
                    }

                  </div>
                </div>


              </div>
            </div>
          )}

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
                  <option key={2} value="progress">Progress</option>
                  <option key={3} value="completed">Completed</option>
                  <option key={4} value="closed">Closed</option>
                  <option key={5} value="pendding">All Skipped</option>
                  <option key={6} value="returned">Returned</option>

                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Interest:
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

              {
                paginatedLeads.length > 0 ? (
                  paginatedLeads
                    .map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleRowClick(lead)}
                      >
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
                                        : "/images/user/user-01.jpg"
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
                          {lead.isReturn && (
                            <Badge size="sm" color="warning">
                              retrun
                            </Badge>
                          )}
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
                    ))
                ) : (
                  <TableRow>
                    <td colSpan={9} className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No leads found.
                    </td>
                  </TableRow>

                )
              }
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
