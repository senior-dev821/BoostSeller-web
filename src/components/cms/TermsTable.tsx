'use client';

import { useEffect, useState } from 'react';
import TextArea from '@/components/form/input/TextArea';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { PlusIcon, Trash2Icon, PencilIcon, SaveIcon } from 'lucide-react';

interface LegalSection {
  id?: number;
  title: string;
  content: string;
  list?: string[];
  order: number;
}

interface LegalPageData {
  id: number;
  slug: string;
  title: string;
  welcome: string;
  sections: LegalSection[];
}

export default function TermsTable() {
  const [data, setData] = useState<LegalPageData | null>(null);
  const [form, setForm] = useState<LegalPageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/admin/contents/terms`);
      const json = await res.json();

      // Ensure sections is at least an empty array
      if (!json.sections) json.sections = [];

      setData(json);
      setForm(json);
    };
    fetchData();
  }, []);

  const handleChange =  <K extends keyof LegalPageData> ( field: K, value: LegalPageData[K]) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleSectionChange = <K extends keyof LegalSection>( index: number, field: K, value: LegalSection[K]) => {
    if (!form) return;
    const updatedSections = [...(form.sections ?? [])];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setForm({ ...form, sections: updatedSections });
  };

  const addSection = () => {
    if (!form) return;
    const newSection: LegalSection = {
      title: '',
      content: '',
      list: [],
      order: (form.sections?.length ?? 0) + 1,
    };
    setForm({ ...form, sections: [...(form.sections ?? []), newSection] });
  };

  const removeSection = (index: number) => {
    if (!form) return;
    const updatedSections = (form.sections ?? []).filter((_, i) => i !== index);
    setForm({ ...form, sections: updatedSections });
  };

  const handleSave = async () => {
    if (!form) return;
    await fetch(`/api/admin/contents/terms`, {
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
      <div className="rounded-lg border p-6 bg-white dark:bg-gray-900 shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-2">Page Title</h2>
        {isEditing ? (
          <Input
            value={form.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 bg-white dark:bg-gray-900 shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-2">Welcome Message</h2>
        {isEditing ? (
          <TextArea
            value={form.welcome ?? ''}
            onChange={(val) => handleChange('welcome', val)}
            rows={4}
          />
        ) : (
          <p className="text-muted-foreground whitespace-pre-line">{data.welcome}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 bg-white dark:bg-gray-900 shadow-sm mb-4">
        <h2 className="text-lg font-semibold mb-4">Sections</h2>
        {!isEditing ? (
          <ul className="space-y-3 text-sm text-muted-foreground">
            {data.sections?.map((sec, i) => (
              <li key={i}>
                <strong>{i + 1}. {sec.title}</strong>
                <p>{sec.content}</p>
                {sec.list && (
                  <ul className="list-disc pl-5">
                    {sec.list.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <>
            {(form.sections ?? []).map((sec, index) => (
              <div key={index} className="space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                <Input
                  placeholder="Section Title"
                  value={sec.title ?? ''}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                />
                <TextArea
                  placeholder="Content"
                  value={sec.content ?? ''}
                  onChange={(val) => handleSectionChange(index, 'content', val)}
                />
                <TextArea
                  placeholder="List items (one per line)"
                  value={(sec.list ?? []).join('\n')}
                  onChange={(val) => handleSectionChange(index, 'list', val.split('\n'))}
                  rows={3}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => removeSection(index)}
                  startIcon={<Trash2Icon />}
                >{" "}</Button>
              </div>
            ))}
            <Button size="sm" onClick={addSection} startIcon={<PlusIcon />}>Add Section</Button>
          </>
        )}
      </div>

      <div className="text-right">
        {isEditing ? (
          <Button onClick={handleSave} startIcon={<SaveIcon />}>Save</Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>Edit</Button>
        )}
      </div>
    </div>
  );
}
