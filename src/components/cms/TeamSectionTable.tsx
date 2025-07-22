// File: components/cms/TeamSectionTable.tsx
'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { PencilIcon, SaveIcon, PlusIcon, Trash2Icon } from 'lucide-react';

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
}

interface TeamSection {
  id: number;
  title: string;
  subtitle: string;
  members: TeamMember[];
}

export default function TeamSectionTable() {
  const [data, setData] = useState<TeamSection | null>(null);
  const [form, setForm] = useState<TeamSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/contents/ourteam');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof TeamSection, value: any) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    if (!form) return;
    const newMembers = [...form.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setForm({ ...form, members: newMembers });
  };

  const addMember = () => {
    if (!form) return;
    setForm({
      ...form,
      members: [...form.members, { name: '', role: '', bio: '', avatarUrl: '' }],
    });
  };

  const removeMember = (index: number) => {
    if (!form) return;
    const newMembers = form.members.filter((_, i) => i !== index);
    setForm({ ...form, members: newMembers });
  };

  const handleSave = async () => {
    await fetch('/api/admin/contents/ourteam', {
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
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Team Section Title</h2>
        {isEditing ? (
          <Input value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <TextArea value={form.subtitle} onChange={(val) => handleChange('subtitle', val)} rows={2} />
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        {!isEditing ? (
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            {data.members.map((member, i) => (
              <li key={i}>{member.name} - {member.role}</li>
            ))}
          </ul>
        ) : (
          <>
            {form.members.map((member, index) => (
              <div key={index} className="mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                <div className="grid md:grid-cols-4 gap-4">
                  <Input placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                  <Input placeholder="Role" value={member.role} onChange={(e) => handleMemberChange(index, 'role', e.target.value)} />
                  <Input placeholder="Avatar URL" value={member.avatarUrl} onChange={(e) => handleMemberChange(index, 'avatarUrl', e.target.value)} />
                </div>
                <TextArea
                  placeholder="Bio"
                  value={member.bio}
                  onChange={(val) => handleMemberChange(index, 'bio', val)}
                  rows={3}
                  className="mt-2"
                />
                <div className="text-right mt-2">
                  <Button size="icon" variant="outline" onClick={() => removeMember(index)} startIcon={<Trash2Icon />}>
                    {' '}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addMember} startIcon={<PlusIcon />}>Add Member</Button>
          </>
        )}
      </div>

      <div className="text-right">
        {isEditing ? (
          <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>Save Changes</Button>
        ) : (
          <Button size="md" variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>Edit Section</Button>
        )}
      </div>
    </div>
  );
}
