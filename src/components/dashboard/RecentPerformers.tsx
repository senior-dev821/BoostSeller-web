"use client";

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
import { useRouter } from "next/navigation";
import { User, Phone, Mail, ShieldCheck, Inbox, CheckCircle, BadgeCheck, Archive, Star, BarChart, Timer, Boxes } from "lucide-react";
// Type definitions
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
  groupNames: string[];
  score: number;
  groupRank: number;
  user: {
    id: number;
    avatarPath?: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    isApproved: boolean;
  };
}

export default function RecentPerformers() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);


  const pageSize = 5;
  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

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

  const handleMoreClick = () => {
    router.push("/performer");
  };

  const handleRowClick = (performer: Performer) => {
    setSelectedPerformer(performer);
    setShowDrawer(true);
  };

  return (
    <div className="relative">
      {/* Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* Drawer */}
      {showDrawer && selectedPerformer && (
         <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md  bg-gray-100 dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
				 <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
					 <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              Performer Details
            </h4>
            <button
              onClick={() => setShowDrawer(false)}
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
                  src={
                    selectedPerformer.user.avatarPath
                      ? `${nextServerUrl}${selectedPerformer.user.avatarPath}`
                      : "/images/user/user-01.jpg"
                  }
                  alt={selectedPerformer.user.name}
                />
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedPerformer.user.name}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPerformer.user.email}</p>
              </div>
            </div>
						
						<div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
							<Boxes className="text-blue-400 w-5 h-5" />
							<div className="text-sm font-medium  text-gray-700 dark:text-gray-300">Groups</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{selectedPerformer.groupNames.length > 0 ? (
									selectedPerformer.groupNames.map((group, i) => (
										<Badge key={i} size="sm" color="info">
											{group}
										</Badge>
									))
								) : (
									<span className="text-sm text-gray-500">-</span>
								)}
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
								<div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
									<Star className="text-blue-400 w-5 h-5" />
									<span>Score</span>
								</div>
								<div className="text-center">{selectedPerformer?.score?.toFixed(2) ?? "0.00"}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
								<div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
									<BarChart className="text-yellow-400 w-5 h-5" />
									<span>Rank</span>
								</div>
								<div className="text-center">{selectedPerformer?.groupRank}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<User className="text-blue-400 w-5 h-5" />
									<span>Role</span>
								</div>
								<div>{selectedPerformer?.user.role}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
									<Phone className="text-green-400 w-5 h-5" />
									<span>Phone Number</span>
								</div>
								<div>{selectedPerformer?.user.phoneNumber}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<Mail className="text-purple-400 w-5 h-5" />
									<span>Email</span>
								</div>
								<div>{selectedPerformer?.user.email}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<ShieldCheck className="text-yellow-400 w-5 h-5" />
									<span>Status</span>
								</div>
								<Badge
									size="sm"
									color={selectedPerformer?.user.isApproved ? "success" : "error"}
								>
									{selectedPerformer?.user.isApproved ? "Approved" : "Pending"}
								</Badge>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<Inbox className="text-purple-400 w-5 h-5" />
									<span>Assigned Leads</span>
								</div>
								<div className="text-center">{selectedPerformer?.assignedCount ?? 0}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<CheckCircle className="text-purple-400 w-5 h-5" />
									<span>Accepted Leads</span>
								</div>
								<div className="text-center">{selectedPerformer?.acceptedCount ?? 0}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<BadgeCheck className="text-purple-400 w-5 h-5" />
									<span>Completed Leads</span>
								</div>
								<div className="text-center">{selectedPerformer?.completedCount ?? 0}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<Archive className="text-purple-400 w-5 h-5" />
									<span>Closed Leads</span>
								</div>
								<div className="text-center">{selectedPerformer?.closedCount ?? 0}</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<Timer className="text-purple-400 w-5 h-5" />
									<span>Average Response Time</span>
								</div>
								<div className="text-center">{selectedPerformer?.avgResponseTime.toFixed(2)}s</div>
							</div>
							<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
								<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
									<CheckCircle className="text-purple-400 w-5 h-5" />
									<span>Available</span>
								</div>
								<Badge
									size="sm"
									color={selectedPerformer?.available ? "success" : "error"}
								>
									{selectedPerformer?.available ? "Available" : "Do Not Disturb"}
								</Badge>
							</div>
						</div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Performers</h3>
          <Button size="icon" variant="outline" className="w-8 h-8 p-0" onClick={handleMoreClick}>
            <MoreDotIcon className="fill-gray-500 dark:fill-gray-400" />
          </Button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Performer</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Interest</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Score</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedPerformers.map((performer) => (
                <TableRow
                  key={performer.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleRowClick(performer)}
                >
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
                    <div className="flex justify-center flex-wrap gap-1">
                      {performer.groupNames?.length > 0
                        ? performer.groupNames.map((name, idx) => (
                            <Badge key={idx} size="sm" color="info">
                              {name}
                            </Badge>
                          ))
                        : "Not assigned Group"}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {performer.score?.toFixed(2) ?? "0.00"}
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

        {/* Pagination */}
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
    </div>
  );
}
