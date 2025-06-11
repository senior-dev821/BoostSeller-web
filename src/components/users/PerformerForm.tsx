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
import { User, Phone, Mail, ShieldCheck, Inbox, CheckCircle, BadgeCheck, Archive, Star, BarChart, Timer } from "lucide-react";
import Pagination from "@/components/form/form-elements/Pagination";

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
    id: number,
    avatarPath?: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
    isApproved: boolean;
  };

}

interface Group {
  id: number;
  name: string;
}


export default function PerformerTable() {
  const [performers, setPerformers] = useState<Performer[]>([]);

  const [currentPage, setCurrentPage] = useState(1); //
  const pageSize = 10;

  const [groups, setGroups] = useState<Group[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [editPerformer, setEditPerformer] = useState<Performer | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editApproved, setEditApproved] = useState(false);
  // const [editGroupName, setEditGroupName] = useState("");
  const [editAvailable, setEditAvailable] = useState(false);
  const [editGroupIds, setEditGroupIds] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
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

  const handleApprovalToggle = (userId : number | undefined) => {
     if (typeof userId !== "number") return;
    const newStatus = editApproved;
    
    socketRef.current?.emit("user_approval_changed", {
      userId: userId,
      isApproved: !newStatus,
    });
  };

  const handleEditClick = (performer: Performer) => {
    setEditPerformer(performer);
    setEditName(performer.user.name);
    setEditPhoneNumber(performer.user.phoneNumber);
    setEditEmail(performer.user.email);
    setEditApproved(performer.user.isApproved);
    setEditAvailable(performer.available);
    setEditGroupIds(performer.groupIds);
    // setEditGroupName(performer.groupNames.join(', '));
    setShowEditModal(true);
  }

  const handleInfoClick = (performer: Performer) => {
    setSelectedPerformer(performer);
    setShowInfoModal(true);
  }

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditPerformer(null);
  };

  const handleSaveChanges = async () => {
    if (!editPerformer) return;

    try {
      const res = await fetch('/api/admin/user/performer/edit', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editPerformer.id,
          name: editName,
          phoneNumber: editPhoneNumber,
          email: editEmail,
          isApproved: editApproved,
          isAvailable: editAvailable,
          groupIds: editGroupIds,
        }),
      });

      if (res.ok) {
				const updatedGroupNames = editGroupIds
					.map(id => groups.find(group => group.id === id)?.name)
					.filter((name): name is string => !!name); // Filter out undefineds
			
				// Update local state
				setPerformers((prev) =>
					prev.map((performer) =>
						performer.id === editPerformer.id
							? {
									...performer,
									available: editAvailable,
									groupIds: editGroupIds,
									groupNames: updatedGroupNames, // ✅ Set new group names
									user: {
										...performer.user,
										name: editName,
										phoneNumber: editPhoneNumber,
										email: editEmail,
										isApproved: editApproved,
									},
								}
							: performer
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
    setSelectedPerformer(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!editGroupIds.includes(value)) {
      setEditGroupIds([...editGroupIds, value]);
    }
  };

  const removeGroup = (idToRemove: number) => {
    setEditGroupIds((ids) => ids.filter((id) => id !== idToRemove));
  };


  useEffect(() => {
    fetch("/api/admin/user/performer")
      .then((res) => res.json())
      .then((data) => setPerformers(data));
  }, []);

  useEffect(() => {
    fetch("/api/admin/setting/group")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  const totalPages = Math.ceil(performers.length / pageSize);
  const paginatedPerformers = performers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <div className="  pt-4 mb-4 flex justify-end items-center gap-2 px-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Group:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="All">All</option>
              
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}

              <option value="None">Not Assigned</option>
            </select>
          </div>

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
                  Group
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
                  Available
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
              {paginatedPerformers
                .filter((performer) => {
                  if (selectedGroup === "All") return true;
                  if (selectedGroup === "None") return !performer.groupIds || performer.groupIds.length === 0;
                  return performer.groupIds?.includes(Number(selectedGroup));
                })
                .map((performer) => (
                  <TableRow key={performer.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
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
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
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
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {performer.user.phoneNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {performer.user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={performer.user.isApproved ? "success" : "error"}
                      >
                        {performer.user.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={performer.available ? "success" : "error"}
                      >
                        {performer.available ? "Available" : "Do Not Disturb"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(performer.createdAt))}
                    </TableCell>
                    <TableCell className="px-4 py-3 space-x-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(performer)}
                      >
                        <PencilIcon className="fill-gray-500 dark:fill-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInfoClick(performer)}
                      >
                        <InfoIcon className="fill-gray-500 dark:fill-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPerformer(performer);
                          setShowDeleteModal(true);
                        }}
                      >
                        <TrashBinIcon className="fill-gray-500 dark:fill-gray-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-[584px] p-5 lg:p-10">
            <div className="p-4 w-120">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                Are you sure you want to delete{" "}
                <strong>{selectedPerformer?.user.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedPerformer) return;
                    try {
                      const res = await fetch('/api/admin/user/performer/delete', {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          id: selectedPerformer.id,
                        }),
                      });

                      if (res.ok) {
                        setPerformers(prev =>
                          prev.filter(p => p.id !== selectedPerformer.id)
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
                      editPerformer?.user.avatarPath
                        ? `${nextServerUrl}${editPerformer?.user.avatarPath}`
                        : "/images/user/user-01.jpg"
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
                  <p className="mt-2 text-sm text-white-600 bg-blue-500 border border-blue-300 px-3 py-2 rounded-md">
                    This performer must belong to a group in order to participate in lead distribution.
                  </p>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                    Assigned Group
                  </label>
                  <select
                    defaultValue="default"
                    onChange={handleSelectChange}
                    className="w-full rounded border border-gray-700 px-3 py-2 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default" disabled>-- Select Group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>

                  {editGroupIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editGroupIds.map((id) => {
                        const group = groups.find((g) => g.id === id);
                        if (!group) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full"
                          >
                            <span>{group.name}</span>
                            <button
                              type="button"
                              onClick={() => removeGroup(id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

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
                        handleApprovalToggle(editPerformer?.user.id);
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Approved Status
                  </label>
                  <Badge size="sm" color={editApproved ? "success" : "error"}>
                    {editApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAvailable}
                      onChange={() => setEditAvailable(prev => !prev)}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Available
                  </label>
                  <Badge size="sm" color={editAvailable ? "success" : "error"}>
                    {editAvailable ? "Available" : "Do Not Disturb"}
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
          <Modal isOpen={showInfoModal} onClose={handleCloseInfo} className=" bg-gray-900 text-white rounded-xl max-w-[584px] p-5 lg:p-10">
            <div className="w-full">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-md">
                  <Image
                    width={96}
                    height={96}
                    src={
                      selectedPerformer?.user.avatarPath
                        ? `${nextServerUrl}${selectedPerformer?.user.avatarPath}`
                        : "/images/user/user-01.jpg"
                    }
                    alt={selectedPerformer?.user.name ?? ""}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold">{selectedPerformer?.user.name}</h3>
              </div>
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow w-full sm:w-auto">
                  <Star className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Score</div>
                    <div className="text-center">{selectedPerformer?.score?.toFixed(2) ?? "0.00"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow w-full sm:w-auto">
                  <BarChart className="text-yellow-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Rank</div>
                    <div className="text-center">{selectedPerformer?.groupRank}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <User className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Role</div>
                    <div>{selectedPerformer?.user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <Phone className="text-green-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Phone Number</div>
                    <div>{selectedPerformer?.user.phoneNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <Mail className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Email</div>
                    <div>{selectedPerformer?.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <ShieldCheck className="text-yellow-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Status</div>
                    <Badge
                      size="sm"
                      color={selectedPerformer?.user.isApproved ? "success" : "error"}
                    >
                      {selectedPerformer?.user.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <Inbox className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Assigned Leads</div>
                    <div className="text-center">{selectedPerformer?.assignedCount ?? 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <CheckCircle className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Accepted Leads</div>
                    <div className="text-center">{selectedPerformer?.acceptedCount ?? 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <BadgeCheck className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Completed Leads</div>
                    <div className="text-center">{selectedPerformer?.completedCount ?? 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <Archive className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Closed Leads</div>
                    <div className="text-center">{selectedPerformer?.closedCount ?? 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <Timer className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Average Response Time</div>
                    <div className="text-center">{selectedPerformer?.avgResponseTime.toFixed(2)}s</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800 shadow">
                  <CheckCircle className="text-purple-400 w-5 h-5" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">Available</div>
                    <Badge
                      size="sm"
                      color={selectedPerformer?.available ? "success" : "error"}
                    >
                      {selectedPerformer?.user.isApproved ? "Available" : "Do Not Disturb"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
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
