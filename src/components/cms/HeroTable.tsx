'use client';

import { useEffect, useState } from 'react';
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import { Trash2Icon, PlusIcon, PencilIcon, SaveIcon } from 'lucide-react';

interface HeroButton {
  id?: number;
  text: string;
  type: string;
  url: string;
}

interface HeroSection {
  id: number;
  title: string[];
  subtitle: string;
  ctaButtons: HeroButton[];
}

export default function HeroTable() {
  const [data, setData] = useState<HeroSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<HeroSection | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      const res = await fetch('/api/admin/contents/hero');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchHero();
  }, []);

  const handleChange = <K extends keyof HeroSection>(field: K, value: HeroSection[K]) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleButtonChange = (index: number, field: keyof HeroButton, value: string) => {
    if (!form) return;
    const newButtons = [...form.ctaButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setForm({ ...form, ctaButtons: newButtons });
  };

  const addButton = () => {
    if (!form) return;
    const newButton: HeroButton = { text: '', type: '', url: '' };
    setForm({ ...form, ctaButtons: [...form.ctaButtons, newButton] });
  };

  const removeButton = (index: number) => {
    if (!form) return;
    const newButtons = form.ctaButtons.filter((_, i) => i !== index);
    setForm({ ...form, ctaButtons: newButtons });
  };

  const handleSave = async () => {
    await fetch('/api/admin/contents/hero', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(form);
    setIsEditing(false);
  };

  // if (!form || !data) return <p className="text-gray-500">Loading...</p>;
  if (!form || !data) {
    // You can show empty strings or empty arrays so UI doesn't crash
    const emptyForm: HeroSection = {
      id: 0,
      title: [],
      subtitle: '',
      ctaButtons: []
    };
    setForm(emptyForm);
    setData(emptyForm);
    // or just return null to avoid flickering
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Hero Title</h2>
        {isEditing ? (
          <TextArea
						placeholder="Enter title lines"
						rows={4}
						value={form?.title.join("\n")}
						onChange={(val) => handleChange("title", val.split("\n"))}
					/>
				
        ) : (
          <ul className="list-disc pl-6 text-sm text-muted-foreground">
            {data.title.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Subtitle */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <TextArea
						placeholder="Enter subtitle"
						rows={2}
						value={form?.subtitle}
						onChange={(val) => handleChange("subtitle", val)}
					/>
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-4">CTA Buttons</h2>
        {!isEditing ? (
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            {data.ctaButtons.map((btn, i) => (
              <li key={i}>{btn.text}</li>
            ))}
          </ul>
        ) : (
          <>
            {form.ctaButtons.map((btn, index) => (
              <div
                key={index}
                className="mb-4 rounded-md bg-gray-50 dark:bg-gray-800 p-4 border flex flex-col gap-4"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Text"
                    value={btn.text}
                    onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                  />
                  <Select
                    options={[
                      { value: 'primary', label: 'Primary' },
                      { value: 'second', label: 'Second' },
                    ]}
                    defaultValue={btn.type}
                    onChange={(val) => handleButtonChange(index, 'type', val)}
                  />
                  <Input
                    placeholder="URL"
                    value={btn.url}
                    onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeButton(index)}
                    startIcon={<Trash2Icon />}
                  >
									{" "}
									</Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addButton} startIcon={<PlusIcon />}>
              Add Button
            </Button>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="text-right">
        {isEditing ? (
          <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        ) : (
          <Button size="md" variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>
            Edit Section
          </Button>
        )}
      </div>
    </div>
  );
}
