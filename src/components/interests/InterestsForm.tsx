'use client';

import React, { useState } from 'react';
import { PencilIcon, TrashBinIcon, PlusIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label"
import Textarea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
;
import { Modal } from '@/components/ui/modal';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Performer {
  id: string;
  name: string;
}

interface Interest {
  id: string;
  name: string;
  description?: string;
  group: string;
  performers: Performer[];
  pipeline?: string;
}

const MOCK_GROUPS = ['Group A', 'Group B', 'Group C'];
const MOCK_PERFORMERS: Performer[] = [
  { id: '1', name: 'Alice Cooper' },
  { id: '2', name: 'Bob Marley' },
  { id: '3', name: 'Charlie Day' },
];

const MOCK_PIPELINES = ['Pipeline A', 'Pipeline B'];

export default function InterestsForm() {
  const [interests, setInterests] = useState<Interest[]>([
    {
      id: '1',
      name: 'Automotive',
      group: 'Group A',
      performers: [MOCK_PERFORMERS[0], MOCK_PERFORMERS[1]],
      description: 'Car-related leads',
    },
    {
      id: '2',
      name: 'Real Estate',
      group: 'Group B',
      performers: [MOCK_PERFORMERS[2]],
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);

  const handleEdit = (interest: Interest) => {
    setEditingInterest(interest);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setInterests((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    if (!editingInterest?.name.trim()) return;

    setInterests((prev) => {
      const exists = prev.find((i) => i.id === editingInterest.id);
      if (exists) {
        return prev.map((i) => (i.id === editingInterest.id ? editingInterest : i));
      }
      return [...prev, { ...editingInterest, id: Date.now().toString() }];
    });

    setModalOpen(false);
    setEditingInterest(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-200">Interest Groups</h1>
        <Button onClick={() => {
          setEditingInterest({
            id: '',
            name: '',
						description: '',
            group: '',
            performers: [],
          });
          setModalOpen(true);
        }}>
          <PlusIcon className="w-4 h-4 mr-1" /> Add Interest
        </Button>
      </div>

      {/* Interest Table */}
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-hidden">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">Interest Name</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">Groups Linked</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">Assigned Performers</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {interests.map((interest) => (
              <TableRow key={interest.id}>
                <TableCell className="px-5 py-4 text-gray-400 text-start text-theme-sm dark:text-gray-200">{interest.name}</TableCell>
                <TableCell  className="px-4 py-3 text-gray-400 text-start text-theme-sm dark:text-gray-400">{interest.group}</TableCell>
                <TableCell  className="px-4 py-3 text-gray-400 text-start text-theme-sm dark:text-gray-400">{interest.performers.length} Performers</TableCell>
                <TableCell className="px-4 py-3 space-x-2 text-start">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(interest)}>
                    <PencilIcon className="fill-gray-500 dark:fill-gray-400" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(interest.id)}>
                    <TrashBinIcon className="fill-gray-500 dark:fill-gray-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal for Add/Edit Interest */}
      {modalOpen && editingInterest && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-[584px] p-5 lg:p-10">
          <div className="space-y-4">
					<Label>Interest Name</Label>
						<Input
              defaultValue={editingInterest.name}
              onChange={(e) =>
                setEditingInterest({ ...editingInterest, name: e.target.value })
              }
            />

						<Label>Description</Label>
						<Textarea
              value={editingInterest.description || ''}
              onChange={(value) =>
                setEditingInterest({
                  ...editingInterest,
                  description: value,
                })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Performer Group
              </label>
              <Select
                options={MOCK_GROUPS.map((g) => ({ value: g, label: g }))}
                defaultValue={editingInterest.group}
                onChange={(value) =>
                  setEditingInterest({ ...editingInterest, group: value })
                }
              />
            </div>

            {/* Performer Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Assign Performers
              </label>
              <Select
                options={MOCK_PERFORMERS.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                defaultValue={editingInterest.performers[0]?.id || ''}
                onChange={(value) => {
                  const performer = MOCK_PERFORMERS.find((p) => p.id === value);
                  if (performer && !editingInterest.performers.find((p) => p.id === value)) {
                    setEditingInterest({
                      ...editingInterest,
                      performers: [...editingInterest.performers, performer],
                    });
                  }
                }}
              />
              {editingInterest.performers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {editingInterest.performers.map((p) => (
										<div
											key={p.id}
											className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full"
										>
											<span>{p.name}</span>
											<button
												onClick={() =>
													setEditingInterest({
														...editingInterest,
														performers: editingInterest.performers.filter((perf) => perf.id !== p.id),
													})
												}
												className="text-red-500 hover:text-red-700 font-bold"
											>
												×
											</button>
										</div>
									))}
                </div>
              )}
            </div>

            {/* Optional Pipeline */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Pipeline (optional)
              </label>
              <Select
                options={MOCK_PIPELINES.map((p) => ({ value: p, label: p }))}
                defaultValue={editingInterest.pipeline || ''}
                onChange={(value) =>
                  setEditingInterest({ ...editingInterest, pipeline: value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
