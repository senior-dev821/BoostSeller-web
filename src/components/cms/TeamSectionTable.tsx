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
  const [data, setData] = useState<TeamSection>({
    id: 0,
    title: '',
    subtitle: '',
    members: [],
  });
  const [form, setForm] = useState<TeamSection>({
    id: 0,
    title: '',
    subtitle: '',
    members: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/contents/ourteam');
        const json = await res.json();
        setData({
          ...json,
          members: json.members ?? [],
        });
        setForm({
          ...json,
          members: json.members ?? [],
        });
      } catch (err) {
        console.error('Failed to fetch team section:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof TeamSection, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...form.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setForm({ ...form, members: newMembers });
  };

  const addMember = () => {
    setForm({
      ...form,
      members: [...form.members, { name: '', role: '', bio: '', avatarUrl: '' }],
    });
  };

  const removeMember = (index: number) => {
    const newMembers = form.members.filter((_, i) => i !== index);
    setForm({ ...form, members: newMembers });
  };

  const handleSave = async () => {
    try {
      await fetch('/api/admin/contents/ourteam', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setData(form);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save team section:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Team Section Title</h2>
        {isEditing ? (
          <Input value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      {/* Section Subtitle */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <TextArea value={form.subtitle || ''} onChange={(val) => handleChange('subtitle', val)} rows={2} />
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      {/* Team Members */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        {!isEditing ? (
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            {data.members?.map((member, i) => (
              <li key={i}>
                {member.name} - {member.role}
              </li>
            ))}
          </ul>
        ) : (
          <>
            {form.members.map((member, index) => (
              <div key={index} className="mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Name"
                    value={member.name || ''}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Role"
                    value={member.role || ''}
                    onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                  />
                  <Input
                    placeholder="Avatar URL"
                    value={member.avatarUrl || ''}
                    onChange={(e) => handleMemberChange(index, 'avatarUrl', e.target.value)}
                  />
                </div>
                <TextArea
                  placeholder="Bio"
                  value={member.bio || ''}
                  onChange={(val) => handleMemberChange(index, 'bio', val)}
                  rows={3}
                  className="mt-2"
                />
                <div className="text-right mt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeMember(index)}
                    startIcon={<Trash2Icon />}
                  >
                    {' '}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addMember} startIcon={<PlusIcon />}>
              Add Member
            </Button>
          </>
        )}
      </div>

      {/* Save / Edit Button */}
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
