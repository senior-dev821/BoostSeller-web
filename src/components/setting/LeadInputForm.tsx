"use client";
import React, { useEffect, useState } from "react";


import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal"; 
import { Trash2Icon } from 'lucide-react';
// Types

interface LeadInputSetting {
  id: number;
	uid: string;
  label: string;
  type: string;
	sequence: number,
  required: boolean;
  items?: string[];
}

export default function LeadFormPage() {
  const [customFields, setCustomFields] = useState<LeadInputSetting[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<LeadInputSetting | null>(null);
	
	useEffect(() => {
		const fetchFields = async () => {
			try {
				const res = await fetch("/api/setting/lead-input");
				if (!res.ok) throw new Error("Failed to fetch fields");
				const data = await res.json();
	
				if (Array.isArray(data.fields)) {
					const enrichedFields = data.fields.map((field: LeadInputSetting) => ({
						...field,
						uid:
							typeof crypto !== "undefined" && crypto.randomUUID
								? crypto.randomUUID()
								: Date.now().toString() + Math.random().toString(36),
					}));
					setCustomFields(enrichedFields);
				} else {
					setCustomFields([]);
				}
			} catch (error) {
				console.error("Error loading custom fields:", error);
				setCustomFields([]);
			}
		};
	
		fetchFields();
	}, []);
	
  const addField = () => {
		const uid = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36);

		setCustomFields([
      ...customFields,
      {
			id: 0,
			uid,
			label: "New Field",
			type: "input",
			sequence:0,
			required: false,
			items: [],
		},
    ]);
		setHasChanges(true);
	};
	
  const updateField = (id: string | number, key: keyof LeadInputSetting, value: LeadInputSetting[keyof LeadInputSetting]) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
    setHasChanges(true);
  };

  const confirmDelete = async () => {
    if (fieldToDelete && typeof fieldToDelete.id === "number") {
      await fetch(`/api/setting/lead-input?id=${fieldToDelete.id}`, {
        method: "DELETE",
      });
    }
    setCustomFields((prev) => prev.filter((f) => f.id !== fieldToDelete?.id));
    setFieldToDelete(null);
  };

  const handleSave = async () => {
		try {
			
			const payload = customFields.map((field, index) => {
				const { uid, ...rest } = field;
				console.log("New added field's uid:",uid);
				return {
					...rest,
					sequence: index + 1,
					items: field.type === "dropdown" ? field.items || [] : [],
				};
			});
	
			const res = await fetch("/api/setting/lead-input", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
	
			if (!res.ok) throw new Error("Failed to save fields");
	
			setHasChanges(false);
			window.location.reload();
		} catch (error) {
			console.error("Save failed:", error);
		}
	};

	

  return (
    <div className="flex p-6 gap-6">
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-300">Default Fields</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input disabled placeholder="Name (fixed)" />
            <Input disabled placeholder="Phone (fixed)" />
            <Select options={[{ value: "", label: "" }]} onChange={() => {}} placeholder="Interest (fixed)" />
						<Input disabled placeholder="ID" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-300">Custom Fields</h2>
            <Button onClick={addField}>+ Add Field</Button>
          </div>

          {customFields.map((field) => (
            <div key={field.uid} className="bg-gray-100 dark:bg-gray-800 border rounded-lg p-4 space-y-2 shadow-theme-xs">
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Label"
                  defaultValue={field.label}
                  onChange={(e) => updateField(field.id, "label", e.target.value)}
                />

                <Select
                  options={[
                    { value: "input", label: "Text" },
                    { value: "number", label: "Number" },
                    { value: "date", label: "Date" },
                    { value: "dropdown", label: "Dropdown" },
                    { value: "currency", label: "Currency" },
                  ]}
                  defaultValue={field.type}
                  onChange={(val) => updateField(field.id, "type", val)}
                />

                {field.type === "dropdown" && (
                  <Input
                    placeholder="Comma separated options"
                    defaultValue={field.items?.join(",") || ""}
                    onChange={(e) =>
                      updateField(field.id, "items", e.target.value.split(",").map((s) => s.trim()))
                    }
                  />
                )}

                <div className="flex items-center">
                  <Switch
                    label="Required"
                    defaultChecked={field.required}
                    onChange={(checked) => updateField(field.id, "required", checked)}
                  />
                </div>
              </div>

              <div className="text-right">
                 <button
                  onClick={() => setFieldToDelete(field)}
                  className="text-gray-300 hover:text-gray-500"
                  title="Remove"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="pt-4 flex gap-x-4">
            <Button onClick={handleSave} className="bg-brand-500 hover:bg-brand-700">
              Save Changes
            </Button>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Cancel
						</Button>
          </div>
        )}
      </div>

      <Modal isOpen={!!fieldToDelete} onClose={() => setFieldToDelete(null)} className="max-w-[584px] p-5 lg:p-10">
        <div className="p-4 w-120">
          <h2 className="text-lg text-gray-100 font-medium mb-8">Are you sure you want to delete this field?</h2>
          <div className="flex justify-end gap-6">
            <Button variant="outline" onClick={() => setFieldToDelete(null)}>
              Cancel
            </Button>
            <Button className="bg-red-500 hover:bg-red-400" onClick={confirmDelete}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview */}
      <div className="w-[320px] shrink-0 ml-20 mr-10">
        <h2 className="text-xl font-semibold mb-2 text-gray-300">Preview</h2>
        <div className="border rounded-2xl shadow-lg p-4 bg-gray-100 dark:bg-gray-800 space-y-4">
          <form className="space-y-4">
            <div>
              <Label className="block mb-1">Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Name" />
            </div>
            <div>
              <Label className="block mb-1">Phone <span className="text-red-500">*</span></Label>
              <Input placeholder="Phone" />
            </div>
            <div>
              <Label className="block mb-1">Interest <span className="text-red-500">*</span></Label>
              <Select
                options={[
                  { value: "", label: "Select Interest" },
                  { value: "automotive", label: "Automotive" },
                  { value: "electronics", label: "Electronics" },
                ]}
								onChange={() => {}}
              />
            </div>
						<div>
              <Label className="block mb-1">ID <span className="text-red-500">*</span></Label>
              <Input placeholder="ID" />
            </div>

            {customFields.map((field) => (
              <div key={field.uid}>
                <Label className="block mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === "dropdown" ? (
                  <Select
                    options={field.items?.map((opt) => ({ value: opt.trim(), label: opt.trim() })) || []}
										onChange={() => {}}
                  />
                ) : (
                  <Input type={field.type} placeholder={field.label} />
                )}
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}