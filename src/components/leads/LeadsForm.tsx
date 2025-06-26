"use client"

import React, { useEffect, useState, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import {
  User, Sparkles, DollarSign, CheckCircle, CircleDot, CheckCircle2, XCircle, CircleDashed, Clock, Workflow, Eye, DownloadCloud,
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

type FieldValue = string | string[] | null;

interface Stage {
  id: number;
  name: string;
  description: string;
  requiredFields?: requiredField[];
  curValues?: Record<string, FieldValue>;
}

interface requiredField {
  id: string,
  label: string,
  type: string,
  items?: string[],
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

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export default function LeadForm() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<number>(0);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>("");

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
    console.log(lead);
    setShowInfoDrawer(true);
    setSelectedLead(lead);
    const curStage = lead.stages.find(stage => String(stage.id) === String(lead.stageId));
    setSelectedStage(curStage ?? null);

    let curStageStatus: string = '';

    if (lead.status === 'closed') {
      curStageStatus = 'closed';
    } else if (lead.status !== 'completed' && lead.stageId !== 0) {
      curStageStatus = 'progress';
    }
    setSelectedStageStatus(curStageStatus);
  }

  const handleStageClick = (stage: Stage, status: string) => {
    setSelectedStage(stage);
    setSelectedStageStatus(status);
    console.log(stage);

  }

  const InfoCard = ({ icon, title, children }: InfoCardProps) => (
    <div className="flex items-center gap-3 p-4 rounded-lg  bg-gray-200 dark:bg-gray-800 shadow">
      {icon}
      <div>
        <div className="text-ms font-medium ">{title}</div>
        <div className="text-gray-600 dark:text-gray-400">{children}</div>
      </div>
    </div>
  );

  const renderFieldValue = (field: requiredField, value: FieldValue) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'currency':
      case 'comment':
      case 'date':
        return <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded-md">{value || ''}</p>;

      case 'toggle':
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-600 text-gray-400' : 'bg-red-600 text-gray-400'}`}
          >
            {value ? 'Yes' : 'No'}
          </span>
        );

      case 'dropdown':
        return <p className="text-sm text-gray-600 dark:text-gray-400">{value || ''}</p>;

      case 'checkbox group': {
        const selectedValues: string[] = Array.isArray(value)
          ? value
          : typeof value === 'string'
            ? value.split(',').map(v => v.trim())
            : [];
        return (
          <div className="grid grid-cols-2 gap-3">
            {(field.items || []).map((item) => {
              const isChecked = selectedValues.includes(item);
              return (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="form-checkbox h-5 w-5 text-green-500 bg-gray-300 dark:bg-gray-800 border-gray-600 rounded"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        );
      }

      case 'checkbox': {
        const isChecked = value === 'true';
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="form-checkbox h-5 w-5 text-green-500 bg-gray-800 border-gray-600 rounded"
            />
            <label className="text-sm text-gray-600 dark:text-gray-400">{field.label}</label>
          </div>
        );
      }


      case 'file':
      case 'photo':
      case 'camera':
        return (
          <div className="flex flex-wrap gap-3">
            {value && (
              <a
                href={`${nextServerUrl}${value}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
              >
                <DownloadCloud className="w-4 h-4" />  {field.label}
              </a>
            )}
          </div>
        );

      default:
        return <p className="text-sm text-gray-600 dark:text-gray-400 italic">Unsupported field type</p>;
    }
  };

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
        return <CheckCircle className="w-4 h-4" style={{ color: 'blue' }} />;
      case "progress":
        return <CircleDashed className="w-4 h-4" style={{ color: 'indigo' }} />;
      case "closed":
        return <XCircle className="w-4 h-4" style={{ color: 'red' }} />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'green' }} />;
      case "upcoming":
        return <Clock className="w-5 h-5" style={{ color: 'purple' }} />;
      default:
        return <CircleDot className="text-gray-400 w-4 h-4" />;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">

          {showInfoDrawer && selectedLead && (

            <div className="fixed inset-0 bg-gray-300 dark:bg-gray-700 bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg w-[800px] max-h-[90vh] overflow-hidden relative flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-400 dark:text-white">Lead Details</h4>
                  <button
                    onClick={() => {
                      setShowInfoDrawer(false);
                      setSelectedStage(null);
                      setSelectedLead(null);
                      setSelectedStageStatus('');
                    }}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 space-y-4 overflow-y-auto">

                  {/* Lead Avatar and Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 overflow-hidden rounded-full">
                      <Image
                        width={64}
                        height={64}
                        src="/images/user/avatar_lead.png"
                        alt={selectedLead.name}
                      />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-400 dark:text-white">{selectedLead.name}</h5>
                      <p className="text-sm text-gray-400">{selectedLead.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

                    {/* AddedBy */}
                    <InfoCard icon={<User className="text-blue-400 w-5 h-5" />} title="AddedBy">
                      {selectedLead.hostess.user.name}
                    </InfoCard>

                    {/* AssignedTo */}
                    <InfoCard icon={<User className="text-blue-400 w-5 h-5" />} title="AssignedTo">
                      {selectedLead.assignedName || "Not assigned"}
                    </InfoCard>

                    {/* AcceptedBy */}
                    <InfoCard icon={<User className="text-blue-400 w-5 h-5" />} title="AcceptedBy">
                      {selectedLead.acceptedName || "Not accepted"}
                    </InfoCard>

                    {/* Interest */}
                    <InfoCard icon={<Sparkles className="text-blue-400 w-5 h-5" />} title="Interest">
                      {selectedLead.interest.name}
                    </InfoCard>

                    {/* Status */}
                    <InfoCard icon={<CheckCircle className="text-yellow-400 w-5 h-5" />} title="Status">
                      <div className="space-x-1">
                        {selectedLead.isReturn && (
                          <Badge size="sm" color="warning">return</Badge>
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
                    </InfoCard>

                    {/* Budget */}
                    <InfoCard icon={<DollarSign className="text-green-400 w-5 h-5" />} title="Budget">
                      {getBudgetFromLead(selectedLead)}
                    </InfoCard>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
                    {/* Sales Timeline */}
                    <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800 shadow mt-4">
                      <div className="flex items-center gap-3 mb-6">
                        <Workflow className="text-green-400 w-5 h-5" />
                        <h5 className="text-md font-semibold dark:text-white">Sales Stage Timeline</h5>
                      </div>

                      {selectedLead.stages.length === 0 ? (
                        <p className="text-center text-red-500 font-semibold">There are no sales stages for the interest</p>
                      ) : selectedLead.status === 'pendding' ? (
                        <p className="text-center text-red-500 font-semibold">Lead is all skipped</p>
                      ) : selectedLead.status === 'closed' && selectedLead.stageId === 0 ? (
                        <p className="text-center text-red-500 font-semibold">Lead is all skipped and Closed</p>
                      ) : selectedLead.status === 'assigned' ? (
                         <p className="text-center text-red-500 font-semibold">This lead hasn’t been accepted yet.</p>
                      )  : (
                        <div className="relative pl-8">
                          {selectedLead.stages.map((stage, index) => {
                            const isClosed = selectedLead.status === "closed";
                            const isLast = index === selectedLead.stages.length - 1;
                            const currentStageIndex = selectedLead.stages.findIndex(s => s.id === selectedLead.stageId);
                            const status = getStageStatus(index, currentStageIndex, isClosed, isLast);

                            return (
                              <div
                                key={stage.id}
                                // className="relative min-h-[60px] group cursor-pointer  hover:bg-gray-50 dark:hover:bg-gray-700 p-2"
                                className={`relative min-h-[60px] group cursor-pointer p-2 rounded-md transition
                                ${stage.id === selectedLead.stageId
                                  ? "bg-blue-200 dark:bg-blue-900 border border-blue-500 shadow text-blue-900 font-semibold"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => handleStageClick(stage, status)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 text-right pr-2 text-sm text-gray-800 dark:text-gray-400">{stage.name}</div>
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    {getStageIcon(status)}
                                  </div>
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
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-gray-200 dark:bg-gray-800 shadow border mt-4">
                      <div className="flex items-center gap-3 mb-6">
                        <Eye className="text-green-400 w-5 h-5" />
                        <h5 className="text-md font-semibold dark:text-white">Sales Stage Detail</h5>
                      </div>

                      {/* Exception Case: All Skipped */}
                      {selectedLead.status === 'assigned' ? (
                        <div className="p-4 bg-gray-300 dark:bg-gray-900 border rounded-md text-gray-600 dark:text-gray-25 text-md">
                          <strong>Not Accepted</strong> lead was not accepted by the performer.
                        </div>
                      ) : selectedLead.stageId === 0 ? (
                        <>
                        <div className="p-4 bg-gray-300 dark:bg-gray-900 border rounded-md text-gray-600 dark:text-gray-25 text-md">
                          <strong>Skipped:</strong> This lead has been marked as skipped. No sales stage information is available.
                        </div>
                       
                          <div className="mt-4 p-4 bg-gray-300 dark:bg-gray-900 rounded-md text-gray-600 dark:text-gray-25 text-md">
                            <strong>Closed Reason:</strong> All Skipped
                          </div>
                         
                        </>

                      ) : (
                        <>

                          <div className="mb-4 p-4 bg-gray-300 dark:bg-gray-900 rounded-md">
                            <h6 className="mb-4 text-md text-gray-800 dark:text-white font-bold">Stage Name</h6>
                            <p className="text-sm text-gray-600 dark:text-gray-25 font-medium">{selectedStage?.name}</p>
                          </div>

                          <div className="mb-6 p-4 bg-gray-300 dark:bg-gray-900 border-gray-400 rounded-md">
                            <h6 className="mb-4 text-md text-gray-800 dark:text-white font-bold">Description</h6>
                            <p className="text-sm text-gray-600 dark:text-gray-25 font-medium">{selectedStage?.description}</p>
                          </div>


                          {
                            selectedStageStatus === 'closed'
                              ? (
                                <>
                                <div className="p-4 bg-gray-300 dark:bg-gray-900 rounded-md text-gray-600 dark:text-gray-25 text-md">
                                  <strong>Closed:</strong> This lead is closed.
                                </div>

                                {selectedStage?.curValues && (
                                  <div className="mt-4 p-4 bg-gray-300 dark:bg-gray-900 rounded-md text-gray-600 dark:text-gray-25 text-md">
                                    <strong>Reason:</strong> {selectedStage.curValues.reason}
                                    {selectedStage.curValues.comment && (
                                      <>
                                        <br />
                                        <strong>Comment:</strong> {selectedStage.curValues.comment}
                                      </>
                                    )}
                                  </div>
                                  )}
                                </>
                              )
                              : selectedStageStatus === 'upcoming'
                                ?
                                (
                                  <div className="p-4 bg-gary-300 dark:bg-gray-900 border border-gray-400 rounded-md text-gray-600 dark:text-gray-25 text-md">
                                    <strong>Upcoming:</strong> This stage is upcoming. Please complete the current stage before accessing details.
                                  </div>
                                )
                                : selectedStageStatus === 'progress'
                                  ? (
                                    <div className="p-4 bg-gary-300 dark:bg-gray-900 border border-gray-400 rounded-md text-gray-600 dark:text-gray-25 text-md">
                                      <strong>Progress:</strong> You are currently working on this stage. Please ensure all required details are completed to move forward.
                                    </div>
                                  )
                                  : (selectedStage?.requiredFields?.map((field) => (
                                    <div key={field.label} className="mb-4 p-4 bg-gray-300 dark:bg-gray-900 border rounded-md">
                                      {field.type !== 'checkbox' && (
                                        <label className="block text-md font-semibold text-gray-800 dark:text-white mb-1">{field.label}</label>
                                      )}
                                      {renderFieldValue(field, selectedStage?.curValues?.[field.label] ?? '')}
                                    </div>
                                  )))
                          }
                        </>
                      )}
                    </div>


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
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                    : "/images/user/avatar_hostess.png"}
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
                                        : "/images/user/avatar_performer.png"
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
                            : ("-")
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
                                    src={
                                      lead.acceptedAvatarPath
                                        ? `${nextServerUrl}${lead.acceptedAvatarPath}`
                                        : "/images/user/avatar_performer.png"
                                    }
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
                             : ("-")
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
      {
        leads.length > pageSize && (
          <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )
      }
    </div >
  );
}
