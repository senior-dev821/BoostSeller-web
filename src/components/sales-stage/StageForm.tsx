'use client';

import React, { useState, useEffect } from 'react';
import { Trash2Icon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
// import Textarea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';
import { PencilIcon, TrashBinIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";

interface Element {
  id: string;
  label: string;
  type: string;
  sequence: number;
  items?: string[];
  required: boolean;
}

interface StageItem {
  id: number;
  name: string;
  description: string;
  sequence: number;
  elements: Element[];
  interestId: number;
}

interface BackendStageItem {
  id: number;
  name: string;
  description: string;
  sequence: number;
  interestId: number;
  requiredFields?: Element[];
}

interface Interest {
  id: number;
  name: string;
}

interface SortableItemProps {
  item: StageItem;
  onClick: (item: StageItem) => void;
}


export default function StageForm() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterestId, setSelectedInterestId] = useState<number | null>(null);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [selectedStage, setSelectedStage] = useState<StageItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetch('/api/setting/interest')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data.interests)) {
          setInterests(data.interests);
        } else {
          console.error("Expected array from /api/setting/interest but got:", data);
          setInterests([]); // fallback to avoid crash
        }
      })
      .catch(err => {
        console.error("Failed to fetch interests:", err);
        setInterests([]); // fallback on error
      });
  }, []);


  useEffect(() => {
    if (selectedInterestId === null) return;
    fetch(`/api/admin/stages?interestId=${selectedInterestId}`)
      .then(res => res.json())
      .then((data: BackendStageItem[]) => {
        const mappedStages: StageItem[] = data.map((s) => ({
          ...s,
          elements: s.requiredFields ?? [],
        }));
        setStages(mappedStages);
        setOriginalOrder(mappedStages.map((s) => s.id));
      });
  }, [selectedInterestId]);


  function SortableItem({ item, onClick }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl shadow p-4 h-20 flex-shrink-0 hover:shadow-md mx-2 flex justify-between items-center"
      >
        <div className="cursor-grab" {...attributes} {...listeners}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h.01M16 9h.01M8 15h.01M16 15h.01" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col">
          <span className="font-semibold">{item.name}</span>
          <span className="text-sm text-gray-400">{item.description || 'No description'}</span>
        </div>

        <Button variant='outline' onClick={() => onClick(item)} className="ml-4">
          <PencilIcon className="fill-gray-500 dark:fill-gray-400" />
        </Button>
        <Button variant='outline' onClick={() => {
          setShowDeleteModal(true);
          setSelectedStage(item);
        }} className="ml-4">
          <TrashBinIcon className="fill-gray-500 dark:fill-gray-400" />
        </Button>

      </div>
    );
  }


  const onDeleteStage = async () => {
    if (selectedStage?.id && typeof selectedStage.id === "number") {
      await fetch(`/api/admin/stages?id=${selectedStage.id}`, {
        method: "DELETE",
      });
    };
    const res = await fetch(`/api/admin/stages?interestId=${selectedInterestId}`);
    const data: BackendStageItem[] = await res.json();

    const updatedStages: StageItem[] = data.map((s) => ({
      ...s,
      elements: s.requiredFields ?? [],
    }));

    setStages(updatedStages);
    setOriginalOrder(updatedStages.map((s) => s.id));
    setShowDeleteModal(false);
    setSelectedStage(null);
  }

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = [...stages];
    const oldIndex = reordered.findIndex(s => s.id === active.id);
    const newIndex = reordered.findIndex(s => s.id === over.id);
    reordered.splice(newIndex, 0, reordered.splice(oldIndex, 1)[0]);

    setStages(reordered);
  };

  const saveReorder = () => {
    setOriginalOrder(stages.map((s) => s.id));
    fetch('/api/admin/stages/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stages.map((s, index) => ({ id: s.id, sequence: index + 1 }))),
    });
  };

  const openStageModal = (stage: StageItem) => {
    if (isDragging) return;
    setSelectedStage({ ...stage });
    setIsModalOpen(true);
  };

  const updateElement = <K extends keyof Element>(id: string, key: K, value: Element[K]) => {
    setSelectedStage((prev) =>
      prev ? {
        ...prev,
        elements: prev.elements.map((el) => (el.id === id ? { ...el, [key]: value } : el)),
      } : null
    );
  };

  const addElement = () => {
    if (!selectedStage) return;
    const newElement: Element = {
      id: Math.random().toString(36).substring(2),
      label: 'New Field',
      type: 'input',
      sequence: selectedStage.elements.length + 1,
      required: false,
      items: [],
    };
    setSelectedStage((prev) => (prev ? { ...prev, elements: [...prev.elements, newElement] } : prev));
  };



  const removeElement = (id: string) => {
    setSelectedStage((prev) => {
      if (!prev || !prev.elements) return prev;
      return {
        ...prev,
        elements: prev.elements.filter((el) => el.id !== id),
      };
    });
  };


  const saveStageDetails = () => {
    if (!selectedStage) return;
    const payload = {
      ...selectedStage,
      requiredFields: selectedStage.elements,
      interestId: selectedStage.interestId,
    };
    const method = selectedStage.id ? 'PUT' : 'POST';
    const endpoint = '/api/admin/stages';
    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => {
      setIsModalOpen(false);
      setStages((prev) => {
        const exists = prev.findIndex((s) => s.id === selectedStage.id);
        if (exists !== -1) {
          const updated = [...prev];
          updated[exists] = selectedStage;
          return updated;
        } else {
          return [...prev, { ...selectedStage, id: Math.max(0, ...prev.map(s => s.id)) + 1 }];
        }
      });
    });
  };

  const hasOrderChanged = () =>
    JSON.stringify(originalOrder) !== JSON.stringify(stages.map((s) => s.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select
            options={
              Array.isArray(interests)
                ? interests.map((i) => ({ label: i.name, value: i.id.toString() }))
                : []
            }
            onChange={(val) => setSelectedInterestId(parseInt(val))}
            defaultValue=""
            placeholder="Select Interest"
            className="w-[200px]"
          />
        </div>
        <Button
          onClick={() => {
            if (!selectedInterestId) return; // Prevent action
            setSelectedStage({
              id: 0,
              name: '',
              description: '',
              sequence: stages.length + 1,
              elements: [],
              interestId: selectedInterestId,
            });
            setIsModalOpen(true);
          }}
          disabled={!selectedInterestId}
          variant={!selectedInterestId ? "outline" : "primary"}
        >
          + New Stage
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {stages.map((stage) => (
            <SortableItem key={stage.id} item={stage} onClick={openStageModal} />
          ))}
        </SortableContext>
      </DndContext>

      {hasOrderChanged() && (
        <div className="px-25 py-6">
          <Button onClick={saveReorder}>Save changes</Button>
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-[584px] p-5 lg:p-10">
        <div className="p-4 w-120">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
            Confirm Deletion
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            Are you sure you want to delete?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDeleteStage();
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {isModalOpen && selectedStage && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center">
          <div className="bg-gray-800 rounded p-6 w-[800px] max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl text-gray-200 font-bold mb-4">Edit Stage</h2>
            <Input
              defaultValue={selectedStage.name}
              onChange={(e) => setSelectedStage({ ...selectedStage, name: e.target.value })}
              placeholder="Name"
              className="mb-4"
            />
            <Input
              defaultValue={selectedStage.description || ''}
              onChange={(e) => setSelectedStage({ ...selectedStage, description: e.target.value })}
              placeholder="Description"
              className="mb-4"
            />
            <div className="space-y-3">
              {selectedStage.elements.map((el) => (
                <div key={el.id} className="border rounded p-3 space-y-1">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => removeElement(el.id)}
                      className="text-right fill-gray-500 dark:fill-gray-400"
                      title="Delete"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>
                  <Input defaultValue={el.label} onChange={(e) => updateElement(el.id, 'label', e.target.value)} />
                  <Select
                    options={[
                      { value: "input", label: "Text" },
                      { value: "checkbox", label: "Checkbox" },
                      { value: "checkbox group", label: "Checkbox Group" },
                      { value: "dropdown", label: "Dropdown" },
                      { value: "comment", label: "Comment" },
                      { value: "date", label: "Date" },
                      { value: "currency", label: "Currency" },
                      { value: "photo", label: "Photo Attachment" },
                      { value: "file", label: "File Attachment" },
                      { value: "camera", label: "Camera" },
                      { value: "toggle", label: "Toggle" },
                    ]}
                    defaultValue={el.type}
                    onChange={(val) => updateElement(el.id, "type", val)}
                  />
                  <Input
                    type="number"
                    defaultValue={el.sequence}
                    onChange={(e) => updateElement(el.id, 'sequence', parseInt(e.target.value))}
                  />
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={el.required}
                      onChange={(e) => updateElement(el.id, 'required', e.target.checked)}
                    /> Required
                  </label>
                  {(el.type === 'dropdown') && (
                    <Input
                      placeholder="Comma separated items"
                      defaultValue={(el.items ?? []).join(',') || ""}
                      onChange={(e) => updateElement(el.id, 'items', e.target.value.split(',').map(i => i.trim()))}
                    />
                  )}
                </div>
              ))}
              <Button onClick={addElement} variant="outline">+ Add Element</Button>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={saveStageDetails}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
