
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

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "../ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, InfoIcon, TrashBinIcon } from "@/icons";
import { User, Phone, Mail, ShieldCheck, Layers, CheckCircle, ClipboardCheck } from "lucide-react";
import Pagination from "@/components/form/form-elements/Pagination";

interface Lead {
  id: number;
  name: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

interface Hostess {
  id: number;
  totalCount: number;
  acceptedCount: number;
  completedCount: number;
  createdAt: string;
  lead: Lead[];
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

export default function HostessTable() {
  const [hostesses, setHostesses] = useState<Hostess[]>([]);
  const [currentPage, setCurrentPage] = useState(1); //
  const pageSize = 10; //

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHostess, setSelectedHostess] = useState<Hostess | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editHostess, setEditHostess] = useState<Hostess | null>(null);

  const [editName, setEditName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editApproved, setEditApproved] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
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



  useEffect(() => {
    fetch("/api/admin/user/hostess")
      .then((res) => res.json())
      .then((data) => setHostesses(data));
  }, []);


  const handleApprovalToggle = (userId: number | undefined) => {
    if (typeof userId !== "number") return;
    const newStatus = editApproved;

    socketRef.current?.emit("user_approval_changed", {
      userId: userId,
      isApproved: !newStatus,
    });
  };


  const handleSaveChanges = async () => {
    if (!editHostess) return;

    try {
      const res = await fetch('/api/admin/user/hostess/edit', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editHostess.id,
          name: editName,
          phoneNumber: editPhoneNumber,
          email: editEmail,
          isApproved: editApproved,
        }),
      });

      if (res.ok) {
        // Update local state after successful save
        setHostesses((prev) =>
          prev.map((hostess) =>
            hostess.id === editHostess.id
              ? {
                ...hostess,
                user: {
                  ...hostess.user,
                  name: editName,
                  phoneNumber: editPhoneNumber,
                  email: editEmail,
                  isApproved: editApproved,
                },
              }
              : hostess
          )
        );
        setShowEditModal(false);
      } else {
        console.error("Failed to save hostess info");
      }
    } catch (error) {
      console.error("Error saving hostess info:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditHostess(null);
  };

  const handleEditClick = (hostess: Hostess) => {
    setEditHostess(hostess);
    setEditName(hostess.user.name);
    setEditPhoneNumber(hostess.user.phoneNumber);
    setEditEmail(hostess.user.email);
    setEditApproved(hostess.user.isApproved);
    setShowEditModal(true);
  }

  const handleInfoClick = (hostess: Hostess) => {
    setSelectedHostess(hostess);
    setShowInfoModal(true);
  }

  const handleCloseInfo = () => {
    setShowInfoModal(false);
    setSelectedHostess(null);
  };

  const totalPages = Math.ceil(hostesses.length / pageSize);
  const paginatedHostesses = hostesses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[1]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
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
                  Approved Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Leads (Completed/Accepted/Tatal)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Register Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

              {paginatedHostesses.length > 0 ? (
                paginatedHostesses.map((hostess) => (
                  <TableRow key={hostess.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            width={40}
                            height={40}
                            src={
                              hostess.user.avatarPath
                                ? `${nextServerUrl}${hostess.user.avatarPath}`
                                : "/images/user/user-04.jpg"
                            }
                            alt={hostess.user.name}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {hostess.user.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {hostess.user.role}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {hostess.user.phoneNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {hostess.user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={hostess.user.isApproved ? "success" : "error"}
                      >
                        {hostess.user.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {hostess.completedCount}/ {hostess.acceptedCount}/ {hostess.totalCount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(hostess.createdAt))}
                    </TableCell>
                    <TableCell className="px-4 py-3 space-x-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(hostess)}
                      >
                        <PencilIcon className="fill-gray-500 dark:fill-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInfoClick(hostess)}
                      >
                        <InfoIcon className="fill-gray-500 dark:fill-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedHostess(hostess);
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
                  <td colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No hostesses found.
                  </td>
                </TableRow>
              )


              }
            </TableBody>
          </Table>


          {/* Delete Modal */}

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-[584px] p-5 lg:p-10">
            <div className="p-4 w-120">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                Are you sure you want to delete{" "}
                <strong>{selectedHostess?.user.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedHostess) return;
                    try {
                      const res = await fetch('/api/admin/user/hostess/delete', {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          id: selectedHostess.id,
                        }),
                      });

                      if (res.ok) {
                        setHostesses(prev =>
                          prev.filter(p => p.id !== selectedHostess.id)
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
                  Delete
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
                      editHostess?.user.avatarPath
                        ? `${nextServerUrl}${editHostess?.user.avatarPath}`
                        : "/images/user/user-04.jpg"
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
                        setEditApproved(prev => !prev);
                        handleApprovalToggle(editHostess?.user.id);
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Approved Status
                  </label>
                  <Badge size="sm" color={editApproved ? "success" : "error"}>
                    {editApproved ? "Approved" : "Pending"}
                  </Badge>
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
          <Modal isOpen={showInfoModal} onClose={handleCloseInfo} className=" bg-gray-100 dark:bg-gray-800 text-white rounded-xl p-6 max-w-[584px] lg:p-10">
            <div className="w-full">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                  <Image
                    width={96}
                    height={96}
                    src={
                      selectedHostess?.user.avatarPath
                        ? `${nextServerUrl}${selectedHostess?.user.avatarPath}`
                        : "/images/user/user-04.jpg"
                    }
                    alt={selectedHostess?.user.name ?? ""}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">{selectedHostess?.user.name}</h3>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
                  <User className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</div>
                    <div className="text-gray-600 dark:text-gray-400">{selectedHostess?.user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
                  <Phone className="text-green-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</div>
                    <div className="text-gray-600 dark:text-gray-400">{selectedHostess?.user.phoneNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
                  <Mail className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</div>
                    <div className="text-gray-600 dark:text-gray-400">{selectedHostess?.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow">
                  <ShieldCheck className="text-yellow-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</div>
                    <Badge
                      size="sm"
                      color={selectedHostess?.user.isApproved ? "success" : "error"}
                    >
                      {selectedHostess?.user.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
                  <Layers className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Leads</div>
                    <div className="text-center text-gray-600 dark:text-gray-400">{selectedHostess?.totalCount ?? 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
                  <CheckCircle className="text-green-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Accepted Leads</div>
                    <div className="text-center text-gray-600 dark:text-gray-400">{selectedHostess?.acceptedCount ?? 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 shadow w-full sm:w-auto">
                  <ClipboardCheck className="text-yellow-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Leads</div>
                    <div className="text-center text-gray-600 dark:text-gray-400">{selectedHostess?.completedCount ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

        </div>
      </div>
      {/* ✅ Pagination */}
      {hostesses.length > pageSize && (
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