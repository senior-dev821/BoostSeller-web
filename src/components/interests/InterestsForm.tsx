'use client';

import React, { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Textarea from '@/components/form/input/TextArea';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Interest {
  id: number;
  name: string;
  description?: string;
}

export default function InterestsForm() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);

	const fetchInterests = async () => {
		try {
			const res = await fetch('/api/setting/interest');
			const data = await res.json();

			if (Array.isArray(data.interests)) {
				setInterests(data.interests);
			} else {
				console.log('Unexpected response format:', data.interests);
				setInterests([]); // fallback to empty array
			}
		} catch (error) {
			console.log('Failed to fetch interests:', error);
			setInterests([]); // fallback on failure
		}
	};
  useEffect(() => {
		
		fetchInterests();
	}, []);
	
  const handleEdit = (interest: Interest) => {
    setEditingInterest(interest);
    setModalOpen(true);
  };

  // const handleDelete = async (id: number) => {
  //   await fetch(`/api/setting/interest/${id}`, { method: 'DELETE' });
  //   setInterests(prev => prev.filter(i => i.id !== id));
  // };

	const handleSave = async () => {
		if (!editingInterest?.name.trim()) return;
	
		const isNew = !editingInterest.id;
		const url = isNew
			? '/api/setting/interest'
			: `/api/setting/interest/${editingInterest.id}`;
		const method = isNew ? 'POST' : 'PUT';
	
		const res = await fetch(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(editingInterest),
		});
	
		if (res.ok) {
			await fetchInterests(); // ✅ Refresh data from backend
			setModalOpen(false);
			setEditingInterest(null);
		} else {
			const error = await res.json();
			alert(error.message || 'Failed to save interest.');
		}
	};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-200">Interest Groups</h1>
        <Button onClick={() => {
          setEditingInterest({ id: 0, name: '', description: '' });
          setModalOpen(true);
        }}>
          <PlusIcon className="w-4 h-4 mr-1" /> Add Interest
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="border-b border-gray-300 dark:border-white/[5]">
            <TableRow>
              <TableCell isHeader  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Interest</TableCell>
              <TableCell isHeader  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
						{Array.isArray(interests) &&
							interests.map((interest) => {
								if (!interest?.id) return null; // safeguard

								return (
									<TableRow key={interest.id}>
										<TableCell className="px-5 py-4 sm:px-6 text-start">
											<div className="flex items-center gap-2">
												<span className="font-medium">{interest.name}</span>
												<span className="text-sm text-gray-500">— {interest.description}</span>
											</div>
										</TableCell>
										<TableCell className="px-4 py-3 space-x-2 text-center">
											<Button size="sm" variant="outline" onClick={() => handleEdit(interest)}>
												<PencilIcon />
											</Button>
											{/* <Button size="sm" variant="outline" onClick={() => handleDelete(interest.id)}>
												<TrashBinIcon />
											</Button> */}
										</TableCell>
									</TableRow>
								);
							})}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {modalOpen && editingInterest && (
        <Modal isOpen onClose={() => setModalOpen(false)} className="max-w-[584px] p-5 lg:p-10">
          <div className="space-y-4 p-6">
            <Label>Interest Name</Label>
            <Input
              defaultValue={editingInterest.name}
              onChange={e => setEditingInterest({ ...editingInterest, name: e.target.value })}
            />
            <Label>Description</Label>
            <Textarea
              value={editingInterest.description || ''}
              onChange={val => setEditingInterest({ ...editingInterest, description: val })}
							placeholder='Description'
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
);
}
