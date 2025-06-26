"use client"

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Button from "../ui/button/Button";
import { PencilIcon, InfoIcon, TrashBinIcon } from "@/icons";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { User, Phone, Mail, ShieldCheck, ClockAlert } from "lucide-react";
import Pagination from "@/components/form/form-elements/Pagination";
import DatePicker from "@/components/form/date-picker"


interface Admin {
  id: number;
	endDate: string;
	createdAt: string;
	status: string;
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
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export default function AdminTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [currentPage, setCurrentPage] = useState(1); //
  const pageSize = 10;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editApproved, setEditApproved] = useState(false);
  const [editEndDate, setEditEndDate] = useState("");
	const [status] = useState("");

  const nextServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(); // Only initialize once
    }

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleApprovalToggle = (userId: number | undefined) => {
    if (typeof userId !== "number") return;
    const newStatus = editApproved;

    socketRef.current?.emit("user_approval_changed", {
      userId: userId,
      isApproved: !newStatus,
    });
  };

  const handleEditClick = (admin: Admin) => {
    setEditAdmin(admin);
    setEditName(admin.user.name);
    setEditPhoneNumber(admin.user.phoneNumber);
    setEditEmail(admin.user.email);
		setEditEndDate(admin.endDate);
    setEditApproved(admin.user.isApproved);

    setShowEditModal(true);
  }

  const handleInfoClick = (performer: Admin) => {
    setSelectedAdmin(performer);
    setShowInfoModal(true);
  }

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditAdmin(null);
  };

  const handleSaveChanges = async () => {
    if (!editAdmin) return;

    try {
      const res = await fetch('/api/admin/user/admins/edit', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editAdmin.id,
          name: editName,
          phoneNumber: editPhoneNumber,
          email: editEmail,
          isApproved: editApproved,
          endDate: editEndDate,
        }),
      });

      if (res.ok) {
        // Update local state
        	setAdmins((prev) =>
          prev.map((admin) =>
					admin.id === editAdmin.id
              ? {
                ...admin,
                endDate: editEndDate,
								status: status,
                user: {
                  ...admin.user,
                  name: editName,
                  phoneNumber: editPhoneNumber,
                  email: editEmail,
                  isApproved: editApproved,
                },
              }
              : admin
          )
        );

        setShowEditModal(false);
      }
      else {
        console.error("Failed to save hostess info");
      }
    } catch (error) {
      console.error("Error saving hostess info:", error);
    }
  };

  const handleCloseInfo = () => {
    setShowInfoModal(false);
    setSelectedAdmin(null);
  };

  useEffect(() => {
    fetch("/api/admin/user/admins")
      .then((res) => res.json())
      .then((data) => setAdmins(data));
  }, []);

  const totalPages = Math.ceil(admins.length / pageSize);
  const paginatedadmins = admins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, []);


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-300 dark:border-white/[5]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Phone Number
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Email Address
                </TableCell>
								<TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Register Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Approved Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  End Date
                </TableCell>
                
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {
                paginatedadmins.length > 0 ?
                  (
                    paginatedadmins
                      .map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <Image
                                  width={40}
                                  height={40}
                                  src={
                                    admin.user.avatarPath
                                      ? `${nextServerUrl}${admin.user.avatarPath}`
                                      : "/images/user/avatar_performer.png"
                                  }
                                  alt={admin.user.name}
                                />
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {admin.user.name}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {admin.user.role}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                            {admin.user.phoneNumber}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                            {admin.user.email}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
														{new Intl.DateTimeFormat(undefined, {
															dateStyle: "medium", // 
														}).format(new Date(admin.createdAt))}
													</TableCell>
													<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                            <Badge
                              size="sm"
                              color={admin.status as BadgeColor}
                            >
                              {admin.user.isApproved ? "Approved" : "Pending"}
                            </Badge>
                          </TableCell>
													<TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
														{new Intl.DateTimeFormat(undefined, {
															dateStyle: "medium", // This gives you something like: "Jun 18, 2025"
														}).format(new Date(admin.endDate))}
													</TableCell>

                          <TableCell className="px-4 py-3 space-x-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(admin)}
                            >
                              <PencilIcon className="fill-gray-500 dark:fill-gray-400" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInfoClick(admin)}
                            >
                              <InfoIcon className="fill-gray-500 dark:fill-gray-400" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteModal(true);
                              }}
                            >
                              <TrashBinIcon className="fill-gray-500 dark:fill-gray-400" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <td colSpan={8} className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No Admins Found.
                      </td>
                    </TableRow>
                  )
              }
            </TableBody>
          </Table>
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-[584px] p-5 lg:p-10">
            <div className="p-4 w-120">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                Are you sure you want to delete{" "}
                <strong>{selectedAdmin?.user.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedAdmin) return;
                    try {
                      const res = await fetch('/api/admin/user/admins/delete', {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          id: selectedAdmin.id,
                        }),
                      });

                      if (res.ok) {
                        setAdmins(prev =>
                          prev.filter(p => p.id !== selectedAdmin.id)
                        );
                        setShowDeleteModal(false);
                      } else {
                        console.error("Failed to delete performer");
                      }
                    } catch (err) {
                      console.error("Error deleting performer:", err);
                    }
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
          {/* Edit Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={handleCancelEdit}
            className="max-w-[584px] p-5 lg:p-10"
          >
            <div className="p-4 w-full max-w-md mx-auto">
              {/* Avatar and Name on top */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                  <Image
                    width={96}
                    height={96}
                    src={
                      editAdmin?.user.avatarPath
                        ? `${nextServerUrl}${editAdmin?.user.avatarPath}`
                        : "/images/user/avatar_performer.png"
                    }
                    alt={editName}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">{editName}</h3>
              </div>
              {/* Editable fields */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editApproved}
                      onChange={() => {
                        setEditApproved(prev => !prev)
                        handleApprovalToggle(editAdmin?.user.id);
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Approved Status
                  </label>
                  <Badge size="sm" color={editApproved ? "success" : "error"}>
                    {editApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
									<DatePicker
										id="to-date"
										label=""
										placeholder="Select end date"
										defaultDate={editEndDate ? new Date(editEndDate) : undefined}
										onChange={(selectedDates) => {
											const d = selectedDates[0] as Date;
											if (d) {
												const localDate = d.toISOString().split('T')[0]; // Format: "2025-06-20"
												setEditEndDate(localDate);
											}
										}}
									/>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
          {/* Info Modal */}
          <Modal isOpen={showInfoModal} onClose={handleCloseInfo} className="bg-gray-100 dark:bg-gray-900 text-white rounded-xl max-w-[584px] p-5 lg:p-10">
            <div className="w-full">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                  <Image
                    width={96}
                    height={96}
                    src={
                      selectedAdmin?.user.avatarPath
                        ? `${nextServerUrl}${selectedAdmin?.user.avatarPath}`
                        : "/images/user/avatar_performer.png"
                    }
                    alt={selectedAdmin?.user.name ?? ""}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{selectedAdmin?.user.name}</h3>
              </div>
              {/* Info Cards */}
              <div>					
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">	
									<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
										<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
											<User className="text-blue-400 w-5 h-5" />
											<span>Role</span>
										</div>
										<div className="text-center text-gray-800 dark:text-gray-200">{selectedAdmin?.user.role}</div>
									</div>
									<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
										<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
											<Phone className="text-green-400 w-5 h-5" />
											<span>Phone Number</span>
										</div>
										<div className="text-center text-gray-800 dark:text-gray-200">{selectedAdmin?.user.phoneNumber}</div>
									</div>
									<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
										<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
											<Mail className="text-purple-400 w-5 h-5" />
											<span>Email</span>
										</div>
										<div className="text-center text-gray-800 dark:text-gray-200">{selectedAdmin?.user.email}</div>
									</div>
									<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
										<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
											<ShieldCheck className="text-yellow-400 w-5 h-5" />
											<span>Status</span>
										</div>
										<Badge
											size="sm"
											color={selectedAdmin?.user.isApproved ? "success" : "error"}
										>
											{selectedAdmin?.user.isApproved ? "Approved" : "Pending"}
										</Badge>
									</div>
									<div className="flex flex-col gap-1 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
										<div className="flex items-center gap-2 text-sm font-medium  text-gray-700 dark:text-gray-300">
											<ClockAlert className="text-red-400 w-5 h-5" />
											<span>End Date</span>
										</div>
										<div className="text-center text-gray-800 dark:text-gray-200">{selectedAdmin?.endDate}</div>
									</div>
								</div>
							</div>
            </div>
          </Modal>
        </div>
      </div>
      {/* ✅ Pagination */}
      {admins.length > pageSize && (
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
