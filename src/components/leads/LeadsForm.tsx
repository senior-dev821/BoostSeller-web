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


export default function LeadForm() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;

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
							{paginatedPerformers.map((lead) => (
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
