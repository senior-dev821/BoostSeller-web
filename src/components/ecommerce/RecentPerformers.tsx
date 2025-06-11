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
import Button from "../ui/button/Button";
import { MoreDotIcon } from "@/icons";
import Pagination from "@/components/form/form-elements/Pagination";
import { useRouter } from 'next/navigation';

// Define the TypeScript interface for the table rows
interface Performer {
  id: number;
  available: boolean;
  assignedCount: number;
  acceptedCount: number;
  completedCount: number;
  closedCount: number;
  avgResponseTime: number;
  createdAt: string;
  groupIds: number[];
  groupName: string;
  score: number;
  groupRank: number;
  user: {
    id: number,
    avatarPath?: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    isApproved: boolean;
  };
}

// interface Group {
//   id: number;
//   name: string;
// }

export default function RecentPerformers() {
	const [performers, setPerformers] = useState<Performer[]>([]);

	const [currentPage, setCurrentPage] = useState(1); //
  const pageSize = 5;

	const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
	const router = useRouter();

	const handleMoreClick = () => {
    router.push('/performer');
  };

	useEffect(() => {
    fetch("/api/admin/user/performer")
      .then((res) => res.json())
      .then((data) => setPerformers(data));
  }, []);

	const totalPages = Math.ceil(performers.length / pageSize);
  const paginatedPerformers = performers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Performers
          </h3>
        </div>

        <div className="flex items-center gap-3">
					<Button
						size="sm"
						variant="outline"
						onClick={() => handleMoreClick()}
					>
						<MoreDotIcon className="fill-gray-500 dark:fill-gray-400" />
					</Button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Performer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Interest
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Score
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
					{paginatedPerformers
                .map((performer)  => (
              <TableRow key={performer.id}>
                <TableCell className="py-3 text-center">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 overflow-hidden rounded-full">
											<Image
												width={40}
												height={40}
												src={
													performer.user.avatarPath
														? `${nextServerUrl}${performer.user.avatarPath}`
														: "/images/user/user-01.jpg"
												}
												alt={performer.user.name}
											/>
										</div>
										<div>
											<span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
												{performer.user.name}
											</span>
											<span className="block text-gray-500 text-theme-xs dark:text-gray-400">
												{performer.user.role}
											</span>
										</div>
									</div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
									{performer.groupName !== undefined ? performer.groupName : "Not assigned Group"}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
									{performer?.score?.toFixed(2) ?? "0.00"}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
									<div className="flex justify-center items-center gap-2">
										<Badge
											size="sm"
											color={performer.user.isApproved ? "success" : "error"}
										>
											{performer.user.isApproved ? "Approved" : "Pending"}
										</Badge>
										<Badge
											size="sm"
											color={performer.available ? "success" : "error"}
										>
											{performer.available ? "Available" : "Do Not Disturb"}
										</Badge>
									</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
			{/* ✅ Pagination */}
      {performers.length > pageSize && (
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
