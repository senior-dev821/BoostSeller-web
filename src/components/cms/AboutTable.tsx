'use client';

import { useEffect, useState } from 'react';
import TextArea from '@/components/form/input/TextArea';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { PlusIcon, SaveIcon, PencilIcon, Trash2Icon } from 'lucide-react';

interface AboutSectionOne {
  id: number;
  title: string;
  subtitle: string;
  contents: string[];
  listItems1: string[];
  listItems2: string[];
}

interface Benefit {
  id?: number;
  title: string;
  description: string;
}

interface AboutSectionTwo {
  id: number;
  title: string;
  subtitle: string;
  benefites: Benefit[];
}

interface AboutData {
  sectionOne: AboutSectionOne;
  sectionTwo: AboutSectionTwo;
}

export default function AboutTable() {
  const [data, setData] = useState<AboutData | null>(null);
  const [form, setForm] = useState<AboutData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/contents/about');
      const json = await res.json();

      // Provide default values if missing to avoid null errors
      const safeData: AboutData = {
        sectionOne: json.sectionOne ?? {
          id: 0,
          title: '',
          subtitle: '',
          contents: [],
          listItems1: [],
          listItems2: [],
        },
        sectionTwo: json.sectionTwo ?? {
          id: 0,
          title: '',
          subtitle: '',
          benefites: [],
        },
      };

      setData(safeData);
      setForm(safeData);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/contents/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(form);
    setIsEditing(false);
  };

  const handleBenefitChange = (index: number, field: keyof Benefit, value: string) => {
    if (!form || !form.sectionTwo) return;
    const updated = [...form.sectionTwo.benefites];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, sectionTwo: { ...form.sectionTwo, benefites: updated } });
  };

  const addBenefit = () => {
    if (!form) return;

    // Initialize sectionTwo if null
    if (!form.sectionTwo) {
      setForm({
        ...form,
        sectionTwo: {
          id: 0,
          title: '',
          subtitle: '',
          benefites: [{ title: '', description: '' }],
        },
      });
      return;
    }

    setForm({
      ...form,
      sectionTwo: {
        ...form.sectionTwo,
        benefites: [...(form.sectionTwo.benefites ?? []), { title: '', description: '' }],
      },
    });
  };

  const removeBenefit = (index: number) => {
    if (!form || !form.sectionTwo) return;
    const updated = form.sectionTwo.benefites.filter((_, i) => i !== index);
    setForm({ ...form, sectionTwo: { ...form.sectionTwo, benefites: updated } });
  };

  if (!data || !form) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Section One */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-4">About Section One</h2>
        {isEditing ? (
          <>
            <TextArea
              value={form.sectionOne.title}
              onChange={(val) => setForm({ ...form, sectionOne: { ...form.sectionOne, title: val } })}
              placeholder="Title"
            />
            <TextArea
              value={form.sectionOne.subtitle}
              onChange={(val) => setForm({ ...form, sectionOne: { ...form.sectionOne, subtitle: val } })}
              placeholder="Subtitle"
            />
            <TextArea
              value={form.sectionOne.contents.join('\n')}
              onChange={(val) => setForm({ ...form, sectionOne: { ...form.sectionOne, contents: val.split('\n') } })}
              placeholder="Contents (each line)"
            />
            <TextArea
              value={form.sectionOne.listItems1.join('\n')}
              onChange={(val) => setForm({ ...form, sectionOne: { ...form.sectionOne, listItems1: val.split('\n') } })}
              placeholder="List 1 (each line)"
            />
            <TextArea
              value={form.sectionOne.listItems2.join('\n')}
              onChange={(val) => setForm({ ...form, sectionOne: { ...form.sectionOne, listItems2: val.split('\n') } })}
              placeholder="List 2 (each line)"
            />
          </>
        ) : (
          <>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">{data.sectionOne.title}</h3>
            <p className="text-muted-foreground mb-3">{data.sectionOne.subtitle}</p>
            <ul className="list-disc pl-6 text-sm text-gray-500 dark:text-gray-400 mb-2">
              {data.sectionOne.contents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 text-sm text-gray-500 dark:text-gray-400">
                {data.sectionOne.listItems1.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <ul className="list-disc pl-6 text-sm text-gray-500 dark:text-gray-400">
                {data.sectionOne.listItems2.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Section Two */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-4">About Section Two</h2>
        {isEditing ? (
          <>
            <TextArea
              value={form.sectionTwo.title}
              onChange={(val) => setForm({ ...form, sectionTwo: { ...form.sectionTwo, title: val } })}
              placeholder="Title"
            />
            <TextArea
              value={form.sectionTwo.subtitle}
              onChange={(val) => setForm({ ...form, sectionTwo: { ...form.sectionTwo, subtitle: val } })}
              placeholder="Subtitle"
            />
            {form.sectionTwo.benefites.map((b, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 mb-4 items-center">
                <Input
                  value={b.title}
                  onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                  placeholder="Title"
                />
                <Input
                  value={b.description}
                  onChange={(e) => handleBenefitChange(idx, 'description', e.target.value)}
                  placeholder="Description"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeBenefit(idx)}
                  startIcon={<Trash2Icon />}
                  className="self-start"
                >
                  {' '}
                </Button>
              </div>
            ))}
            <Button size="sm" onClick={addBenefit} startIcon={<PlusIcon />}>
              Add Benefit
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">{data.sectionTwo.title}</h3>
            <p className="text-muted-foreground mb-3">{data.sectionTwo.subtitle}</p>
            <ul className="list-disc pl-6 text-sm text-gray-500 dark:text-gray-400 space-y-1">
              {data.sectionTwo.benefites.map((b, i) => (
                <li key={i}>
                  <strong>{b.title}</strong>: {b.description}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Action */}
      <div className="text-right">
        {isEditing ? (
          <Button onClick={handleSave} startIcon={<SaveIcon />}>
            Save
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" startIcon={<PencilIcon />}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
