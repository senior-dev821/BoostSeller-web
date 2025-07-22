// components/cms/TestimonialsTable.tsx
'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { PencilIcon, PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react';

interface Testimonial {
  id?: number;
  name: string;
  company: string;
  message: string;
  avatarUrl: string;
  rating: number;
}

interface TestimonialsSection {
  id: number;
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

export default function TestimonialsTable() {
  const [data, setData] = useState<TestimonialsSection | null>(null);
  const [form, setForm] = useState<TestimonialsSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/contents/testimonials');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof TestimonialsSection, value: any) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof Testimonial, value: any) => {
    if (!form) return;
    const newItems = [...form.testimonials];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, testimonials: newItems });
  };

  const addItem = () => {
    if (!form) return;
    const newItem: Testimonial = {
      name: '',
      company: '',
      message: '',
      avatarUrl: '',
      rating: 5,
    };
    setForm({ ...form, testimonials: [...form.testimonials, newItem] });
  };

  const removeItem = (index: number) => {
    if (!form) return;
    const newItems = form.testimonials.filter((_, i) => i !== index);
    setForm({ ...form, testimonials: newItems });
  };

  const handleSave = async () => {
    await fetch('/api/admin/contents/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(form);
    setIsEditing(false);
  };

  if (!form || !data) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Testimonials Title</h2>
        {isEditing ? (
          <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <Input value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} />
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      {/* Testimonials */}
      <div className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Testimonials</h2>
        {!isEditing ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {data.testimonials.map((t, i) => (
              <li key={i}>{`${t.name} (${t.company}): ${t.message}`}</li>
            ))}
          </ul>
        ) : (
          <>
            {form.testimonials.map((t, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 flex flex-col gap-4"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Name" value={t.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                  <Input placeholder="Company" value={t.company} onChange={(e) => handleItemChange(index, 'company', e.target.value)} />
                  <Input placeholder="Avatar URL" value={t.avatarUrl} onChange={(e) => handleItemChange(index, 'avatarUrl', e.target.value)} />
                </div>
                <TextArea placeholder="Message" value={t.message} onChange={(val) => handleItemChange(index, 'message', val)} />
                <Input type="number" placeholder="Rating" value={t.rating} onChange={(e) => handleItemChange(index, 'rating', parseInt(e.target.value))} />
                <div className="text-right">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeItem(index)}
                    startIcon={<Trash2Icon />}
                  >
                    {''}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addItem} startIcon={<PlusIcon />}>
              Add Testimonial
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
