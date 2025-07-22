'use client';

import { useEffect, useState } from 'react';
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { PencilIcon, SaveIcon, MailIcon, PhoneIcon } from 'lucide-react';

interface ContactSection {
  id: number;
  title: string;
  subtitle: string;
}

interface NewsletterSection {
  id: number;
  title: string;
  subtitle: string;
  email: string;
  phone: string;
}

interface Combined {
  contact: ContactSection;
  newsletter: NewsletterSection;
}

export default function ContactTable() {
  const [data, setData] = useState<Combined | null>(null);
  const [form, setForm] = useState<Combined | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/contents/contact');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchData();
  }, []);

  const handleChange = (
		section: 'contact' | 'newsletter',
		field: string,
		value: string
	) => {
		if (!form) return;
	
		if (section === 'contact') {
			setForm({
				...form,
				contact: { ...form.contact, [field]: value } as ContactSection,
			});
		} else {
			setForm({
				...form,
				newsletter: { ...form.newsletter, [field]: value } as NewsletterSection,
			});
		}
	};
	

  const handleSave = async () => {
    await fetch('/api/admin/contents/contact', {
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
      {/* Contact Section */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-xl font-semibold mb-4">Contact Section</h2>
        <div className="space-y-3">
          {isEditing ? (
            <>
              <TextArea
                placeholder="Contact Title"
                value={form.contact?.title}
                onChange={(val) => handleChange('contact', 'title', val)}
              />
              <TextArea
                placeholder="Contact Subtitle"
                rows={3}
                value={form.contact?.subtitle}
                onChange={(val) => handleChange('contact', 'subtitle', val)}
              />
            </>
          ) : (
            <>
              <p className="font-medium text-gray-700 dark:text-gray-300">{data.contact?.title}</p>
              <p className="text-sm text-muted-foreground">{data.contact?.subtitle}</p>
            </>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-xl font-semibold mb-4">Newsletter Section</h2>
        <div className="space-y-3">
          {isEditing ? (
            <>
              <TextArea
                placeholder="Newsletter Title"
                value={form.newsletter?.title}
                onChange={(val) => handleChange('newsletter', 'title', val)}
              />
              <TextArea
                placeholder="Newsletter Subtitle"
                value={form.newsletter?.subtitle}
                onChange={(val) => handleChange('newsletter', 'subtitle', val)}
              />
              <Input
                placeholder="Email"
                value={form.newsletter?.email}
                onChange={(e) => handleChange('newsletter', 'email', e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={form.newsletter?.phone}
                onChange={(e) => handleChange('newsletter', 'phone', e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="font-medium text-gray-700 dark:text-gray-300">{data.newsletter?.title}</p>
              <p className="text-sm text-muted-foreground"> {data.newsletter?.subtitle}</p>
              <p className="text-sm text-muted-foreground"> <MailIcon />{data.newsletter?.email}</p>
              <p className="text-sm text-muted-foreground"> <PhoneIcon />{data.newsletter?.phone}</p>
            </>
          )}
        </div>
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
