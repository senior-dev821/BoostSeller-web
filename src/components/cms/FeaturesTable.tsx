'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { PlusIcon, PencilIcon, SaveIcon, Trash2Icon } from 'lucide-react';

interface Feature {
  id?: number;  // might be undefined for new items
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface FeaturesSection {
  id: number;
  title: string;
  subtitle: string;
  features: Feature[];
}

export default function FeaturesTable() {
  const [data, setData] = useState<FeaturesSection | null>(null);
  const [form, setForm] = useState<FeaturesSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      const res = await fetch('/api/admin/contents/features');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchFeatures();
  }, []);

  const handleChange = (field: keyof FeaturesSection, value: any) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    if (!form) return;
    const updated = [...form.features];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, features: updated });
  };

  const addFeature = () => {
    if (!form) return;
    const newFeature: Feature = { title: '', description: '', icon: '', order: 0 };
    setForm({ ...form, features: [...form.features, newFeature] });
  };

  const removeFeature = (index: number) => {
    if (!form) return;
    const filtered = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: filtered });
  };

  const handleSave = async () => {
    await fetch('/api/admin/contents/features', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(form);
    setIsEditing(false);
  };

  if (!form || !data) {
    const emptyForm: FeaturesSection = {
      id: 0,
      title: '',
      subtitle: '',
      features: [],
    };
    setForm(emptyForm);
    setData(emptyForm);
    return null; // Prevent render flicker
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Title</h2>
        {isEditing ? (
          <TextArea value={form.title} onChange={(val) => handleChange('title', val)} />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <TextArea value={form.subtitle} onChange={(val) => handleChange('subtitle', val)} />
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        {!isEditing ? (
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            {data.features.map((feature, idx) => (
              <li key={feature.id ?? `feature-${idx}`}>
                <span className="font-medium text-gray-800 dark:text-white">{feature.title}</span>:{" "}
                <span className="text-gray-600 dark:text-gray-300">{feature.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {form.features.map((feature, index) => (
              <div
                key={feature.id ?? `edit-feature-${index}`}
                className="mb-4 rounded-md bg-gray-50 dark:bg-gray-800 p-4 border flex flex-col gap-4"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Title"
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                  />
                  <TextArea
                    placeholder="Description"
                    value={feature.description}
                    onChange={(val) => handleFeatureChange(index, "description", val)}
                    rows={2}
                  />
                  <Input
                    placeholder="Icon URL"
                    value={feature.icon}
                    onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
                  />
                  <Input
                    placeholder="Order"
                    type="number"
                    value={feature.order}
                    onChange={(e) => handleFeatureChange(index, "order", e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeFeature(index)}
                    startIcon={<Trash2Icon />}
                  >
                    {" "}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addFeature} startIcon={<PlusIcon />}>
              Add Feature
            </Button>
          </>
        )}
      </div>

      <div className="text-right">
        {isEditing ? (
          <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        ) : (
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsEditing(true)}
            startIcon={<PencilIcon />}
          >
            Edit Section
          </Button>
        )}
      </div>
    </div>
  );
}
