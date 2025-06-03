'use client';

import React, { useState, useEffect } from 'react';
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
import Textarea from '@/components/form/input/TextArea';
import Select from '@/components/form/Select';

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
}

interface BackendStageItem {
  id: number;
  name: string;
  description: string;
  sequence: number;
  requiredFields?: Element[];
}

interface SortableItemProps {
  item: StageItem;
  onClick: (item: StageItem) => void;
}

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

      <Button onClick={() => onClick(item)} className="ml-4">Edit</Button>
    </div>
  );
}

export default function StageForm() {
  const [stages, setStages] = useState<StageItem[]>([]);
  const [selectedStage, setSelectedStage] = useState<StageItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stages')
      .then(res => res.json())
      .then((data: BackendStageItem[]) => {
        const mappedStages: StageItem[] = data.map((s) => ({
          ...s,
          elements: s.requiredFields ?? [],
        }));
        setStages(mappedStages);
        setOriginalOrder(mappedStages.map((s) => s.id));
      });
  }, []);

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
      prev
        ? {
            ...prev,
            elements: prev.elements.map((el) => (el.id === id ? { ...el, [key]: value } : el)),
          }
        : null
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

  const saveStageDetails = () => {
    if (!selectedStage) return;

    const payload = {
      ...selectedStage,
      requiredFields: selectedStage.elements,
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
        <h2 className="text-xl font-semibold text-white">Sales Stages</h2>
        <Button
          onClick={() => {
            setSelectedStage({
              id: 0,
              name: '',
              description: '',
              sequence: stages.length + 1,
              elements: [],
            });
            setIsModalOpen(true);
          }}
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
            <div className="flex gap-6">
              <div className="flex-1 space-y-3">
                {selectedStage.elements.map((el) => (
                  <div key={el.id} className="border rounded p-3 space-y-1">
                    <Input
                      defaultValue={el.label}
                      onChange={(e) => updateElement(el.id, 'label', e.target.value)}
                    />
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
                    {(el.type === 'dropdown' || el.type.includes('checkbox')) && (
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
              <div className="w-[280px] h-[500px] bg-gray-700 text-gray-300 rounded p-4 overflow-y-auto">
                {selectedStage.elements.sort((a, b) => a.sequence - b.sequence).map((el) => (
                  <div key={el.id} className="mb-3">
                    <label className="block text-sm font-semibold mb-1">{el.label}</label>
                    {el.type === 'text' && <Input disabled placeholder="Text" />}
                    {el.type === 'textarea' && <Textarea disabled placeholder="Textarea" />}
                    {el.type === 'dropdown' && (
                      <Select
                        options={(el.items ?? []).map((opt) => ({ value: opt, label: opt }))}
                        defaultValue={(el.items?.[0]) ?? ""}
                        onChange={() => {}}
                      />
                    )}
                    {(el.type === 'checkbox group' || el.type === 'checkbox') && (
                      (el.items ?? []).map((opt, i) => (
                        <label key={i} className="block text-sm"><input type="checkbox" disabled /> {opt}</label>
                      ))
                    )}
                  </div>
                ))}
              </div>
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
