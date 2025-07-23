// 'use client';

// import { useEffect, useState } from 'react';
// import TextArea from '@/components/form/input/TextArea';
// import Input from '@/components/form/input/InputField';
// import Button from '@/components/ui/button/Button';
// import { PlusIcon, Trash2Icon, SaveIcon, PencilIcon } from 'lucide-react';

// interface WorkingStep {
//   id?: number;
//   title: string;
//   description: string;
//   order: number;
// }

// interface WorkingStepsSection {
//   id: number;
//   title: string;
//   subtitle: string;
//   videoUrl: string;
//   steps: WorkingStep[];
// }

// export default function WorkingStepsTable() {
//   const [data, setData] = useState<WorkingStepsSection | null>(null);
//   const [form, setForm] = useState<WorkingStepsSection | null>(null);
//   const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch('/api/admin/contents/howitworks');
//       const json = await res.json();
//       setData(json);
//       setForm(json);
//     };
//     fetchData();
//   }, []);

//   const handleChange = (field: keyof WorkingStepsSection, value: any) => {
//     if (!form) return;
//     setForm({ ...form, [field]: value });
//   };

//   const handleStepChange = (index: number, field: keyof WorkingStep, value: string | number) => {
//     if (!form) return;
//     const newSteps = [...form.steps];
//     newSteps[index] = { ...newSteps[index], [field]: value };
//     setForm({ ...form, steps: newSteps });
//   };

//   const addStep = () => {
//     if (!form) return;
//     const newStep: WorkingStep = { title: '', description: '', order: form.steps.length + 1 };
//     setForm({ ...form, steps: [...form.steps, newStep] });
//   };

//   const removeStep = (index: number) => {
//     if (!form) return;
//     const newSteps = form.steps.filter((_, i) => i !== index);
//     setForm({ ...form, steps: newSteps });
//   };

//   const handleSave = async () => {
//     await fetch('/api/admin/contents/howitworks', {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     setData(form);
//     setIsEditing(false);
//   };

//   if (!form || !data) return <p className="text-gray-500">Loading...</p>;

//   return (
//     <div className="space-y-8">
//       {/* Title */}
//       <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
//         <h2 className="text-lg font-semibold mb-2">Title</h2>
//         {isEditing ? (
//           <TextArea
//             placeholder="Enter title"
//             rows={2}
//             value={form.title}
//             onChange={(val) => handleChange('title', val)}
//           />
//         ) : (
//           <p className="text-muted-foreground">{data.title}</p>
//         )}
//       </div>

//       {/* Subtitle */}
//       <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
//         <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
//         {isEditing ? (
//           <TextArea
//             placeholder="Enter subtitle"
//             rows={2}
//             value={form.subtitle}
//             onChange={(val) => handleChange('subtitle', val)}
//           />
//         ) : (
//           <p className="text-muted-foreground">{data.subtitle}</p>
//         )}
//       </div>

//       {/* Video URL */}
//       <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
//         <h2 className="text-lg font-semibold mb-2">Video URL</h2>
//         {isEditing ? (
//           <Input
//             placeholder="Enter video URL"
//             value={form.videoUrl}
//             onChange={(e) => handleChange('videoUrl', e.target.value)}
//           />
//         ) : (
//           <a href={data.videoUrl} className="text-blue-500 underline" target="_blank" rel="noreferrer">
//             {data.videoUrl}
//           </a>
//         )}
//       </div>

//       {/* Steps */}
//       <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
//         <h2 className="text-lg font-semibold mb-4">Steps</h2>
//         {!isEditing ? (
//           <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
//             {data.steps
//               .sort((a, b) => a.order - b.order)
//               .map((step, i) => (
//                 <li key={i}>
//                   {step.order}. {step.title}: {step.description}
//                 </li>
//               ))}
//           </ul>
//         ) : (
//           <>
//             {form.steps.map((step, index) => (
//               <div
//                 key={index}
//                 className="mb-4 rounded-md bg-gray-50 dark:bg-gray-800 p-4 border flex flex-col gap-4"
//               >
//                 <div className="grid md:grid-cols-4 gap-4">
//                   <Input
//                     placeholder="Title"
//                     value={step.title}
//                     onChange={(e) => handleStepChange(index, 'title', e.target.value)}
//                   />
//                   <Input
//                     placeholder="Description"
//                     value={step.description}
//                     onChange={(e) => handleStepChange(index, 'description', e.target.value)}
//                   />
//                   <Input
//                     placeholder="Order"
//                     type="number"
//                     value={step.order}
//                     onChange={(e) => handleStepChange(index, 'order', parseInt(e.target.value) || 1)}
//                   />
//                 </div>
//                 <div className="text-right">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     onClick={() => removeStep(index)}
//                     startIcon={<Trash2Icon />}
//                   >
//                     {" "}
//                   </Button>
//                 </div>
//               </div>
//             ))}
//             <Button size="sm" onClick={addStep} startIcon={<PlusIcon />}>
//               Add Step
//             </Button>
//           </>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="text-right">
//         {isEditing ? (
//           <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>
//             Save Changes
//           </Button>
//         ) : (
//           <Button size="md" variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>
//             Edit Section
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import TextArea from '@/components/form/input/TextArea';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { PlusIcon, Trash2Icon, SaveIcon, PencilIcon } from 'lucide-react';

interface WorkingStep {
  id?: number;
  title: string;
  description: string;
  order: number;
}

interface WorkingStepsSection {
  id: number;
  title: string;
  subtitle: string;
  videoUrl: string;
  steps: WorkingStep[];
}

export default function WorkingStepsTable() {
  const [data, setData] = useState<WorkingStepsSection | null>(null);
  const [form, setForm] = useState<WorkingStepsSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/admin/contents/howitworks');
      const json = await res.json();
      setData(json);
      setForm(json);
    };
    fetchData();
  }, []);

  // Initialize empty form/data if null (avoid crashes or flickering)
  useEffect(() => {
    if (!form || !data) {
      const empty: WorkingStepsSection = {
        id: 0,
        title: '',
        subtitle: '',
        videoUrl: '',
        steps: [],
      };
      setForm(empty);
      setData(empty);
    }
  }, [form, data]);

  const handleChange = (field: keyof WorkingStepsSection, value: any) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleStepChange = (index: number, field: keyof WorkingStep, value: string | number) => {
    if (!form) return;
    const newSteps = [...form.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setForm({ ...form, steps: newSteps });
  };

  const addStep = () => {
    if (!form) return;
    const newStep: WorkingStep = { title: '', description: '', order: form.steps.length + 1 };
    setForm({ ...form, steps: [...form.steps, newStep] });
  };

  const removeStep = (index: number) => {
    if (!form) return;
    const newSteps = form.steps.filter((_, i) => i !== index);
    setForm({ ...form, steps: newSteps });
  };

  const handleSave = async () => {
    if (!form) return;
    await fetch('/api/admin/contents/howitworks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setData(form);
    setIsEditing(false);
  };

  if (!form || !data) return null; // Don't render until initialized

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Title</h2>
        {isEditing ? (
          <TextArea
            placeholder="Enter title"
            rows={2}
            value={form.title}
            onChange={(val) => handleChange('title', val)}
          />
        ) : (
          <p className="text-muted-foreground">{data.title}</p>
        )}
      </div>

      {/* Subtitle */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Subtitle</h2>
        {isEditing ? (
          <TextArea
            placeholder="Enter subtitle"
            rows={2}
            value={form.subtitle}
            onChange={(val) => handleChange('subtitle', val)}
          />
        ) : (
          <p className="text-muted-foreground">{data.subtitle}</p>
        )}
      </div>

      {/* Video URL */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-2">Video URL</h2>
        {isEditing ? (
          <Input
            placeholder="Enter video URL"
            value={form.videoUrl}
            onChange={(e) => handleChange('videoUrl', e.target.value)}
          />
        ) : (
          <a href={data.videoUrl} className="text-blue-500 underline" target="_blank" rel="noreferrer">
            {data.videoUrl}
          </a>
        )}
      </div>

      {/* Steps */}
      <div className="rounded-lg border p-6 shadow-sm bg-white dark:bg-gray-900 mb-4">
        <h2 className="text-lg font-semibold mb-4">Steps</h2>
        {!isEditing ? (
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            {data.steps
              .slice() // copy array before sorting to avoid mutating state
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li key={step.id ?? step.order}>
                  {step.order}. {step.title}: {step.description}
                </li>
              ))}
          </ul>
        ) : (
          <>
            {form.steps.map((step, index) => (
              <div
                key={step.id ?? index}
                className="mb-4 rounded-md bg-gray-50 dark:bg-gray-800 p-4 border flex flex-col gap-4"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Title"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  />
                  <Input
                    placeholder="Order"
                    type="number"
                    value={step.order}
                    onChange={(e) => handleStepChange(index, 'order', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="text-right">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => removeStep(index)}
                    startIcon={<Trash2Icon />}
                  >
                    {' '}
                  </Button>
                </div>
              </div>
            ))}
            <Button size="sm" onClick={addStep} startIcon={<PlusIcon />}>
              Add Step
            </Button>
          </>
        )}
      </div>

      {/* Actions */}
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
