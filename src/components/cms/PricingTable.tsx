// 'use client';

// import { useEffect, useState } from 'react';
// import Input from '@/components/form/input/InputField';
// import Button from '@/components/ui/button/Button';
// import TextArea from '@/components/form/input/TextArea';
// import { PlusIcon, Trash2Icon, PencilIcon, SaveIcon } from 'lucide-react';
// import Switch from '@/components/form/switch/Switch';

// interface PlanFeature {
//   id?: number;
//   text: string;
//   active: boolean;
// }

// interface PricingPlan {
//   id?: number;
//   tag: string;
//   description: string;
//   price: number;
//   duration: string;
//   ctaText: string;
//   ctaUrl: string;
//   order: number;
//   features: PlanFeature[];
// }

// interface PricingSection {
//   id: number;
//   title: string;
//   subtitle: string;
//   plans: PricingPlan[];
// }

// export default function PricingTable() {
//   const [data, setData] = useState<PricingSection | null>(null);
//   const [form, setForm] = useState<PricingSection | null>(null);
//   const [isEditing, setIsEditing] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch('/api/admin/contents/pricing');
//       const json = await res.json();
//       setData(json);
//       setForm(json);
//     };
//     fetchData();
//   }, []);

//   const handlePlanChange = (index: number, field: keyof PricingPlan, value: any) => {
//     if (!form) return;
//     const updatedPlans = [...form.plans];
//     updatedPlans[index] = { ...updatedPlans[index], [field]: value };
//     setForm({ ...form, plans: updatedPlans });
//   };

//   const handleFeatureChange = (planIndex: number, featureIndex: number, field: keyof PlanFeature, value: any) => {
//     if (!form) return;
//     const updatedPlans = [...form.plans];
//     const updatedFeatures = [...updatedPlans[planIndex].features];
//     updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], [field]: value };
//     updatedPlans[planIndex].features = updatedFeatures;
//     setForm({ ...form, plans: updatedPlans });
//   };

//   const addFeature = (planIndex: number) => {
//     if (!form) return;
//     const newFeature: PlanFeature = { text: '', active: true };
//     const updatedPlans = [...form.plans];
//     updatedPlans[planIndex].features.push(newFeature);
//     setForm({ ...form, plans: updatedPlans });
//   };

//   const removeFeature = (planIndex: number, featureIndex: number) => {
//     if (!form) return;
//     const updatedPlans = [...form.plans];
//     updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
//     setForm({ ...form, plans: updatedPlans });
//   };

//   const handleSave = async () => {
//     await fetch('/api/admin/contents/pricing', {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });
//     setData(form);
//     setIsEditing(false);
//   };

//   if (!form || !data) return <p className="text-gray-500">Loading...</p>;

//   return (
//     <div className="space-y-6">
//       <div className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900">
//         <h2 className="font-semibold text-lg mb-2">Pricing Section</h2>
//         {isEditing ? (
//           <>
//             <TextArea value={form.title} onChange={(val) => setForm({ ...form, title: val })} />
//             <TextArea value={form.subtitle} onChange={(val) => setForm({ ...form, subtitle: val })} />
//           </>
//         ) : (
//           <>
//             <p className="text-muted-foreground font-medium">{data.title}</p>
//             <p className="text-muted-foreground text-sm">{data.subtitle}</p>
//           </>
//         )}
//       </div>

//       {form.plans.map((plan, i) => (
//         <div key={i} className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900 space-y-4">
//           <h3 className="font-semibold">Plan #{i + 1}</h3>
//           {isEditing ? (
//             <div className="grid grid-cols-2 gap-4">
//               <Input value={plan.tag} placeholder="Tag" onChange={(e) => handlePlanChange(i, 'tag', e.target.value)} />
//               <Input value={plan.description} placeholder="Description" onChange={(e) => handlePlanChange(i, 'description', e.target.value)} />
//               <Input type="number" value={plan.price} placeholder="Price" onChange={(e) => handlePlanChange(i, 'price', parseFloat(e.target.value))} />
//               <Input value={plan.duration} placeholder="Duration" onChange={(e) => handlePlanChange(i, 'duration', e.target.value)} />
//               <Input value={plan.ctaText} placeholder="CTA Text" onChange={(e) => handlePlanChange(i, 'ctaText', e.target.value)} />
//               <Input value={plan.ctaUrl} placeholder="CTA Url" onChange={(e) => handlePlanChange(i, 'ctaUrl', e.target.value)} />
//             </div>
//           ) : (
//             <div className="text-sm text-muted-foreground">
//               <p>{plan.tag} - {plan.description}</p>
//               <p>${plan.price} / {plan.duration}</p>
//               <p>{plan.ctaText} → {plan.ctaUrl}</p>
//             </div>
//           )}

//           <div className="space-y-2">
//             <h4 className="font-semibold text-sm">Features</h4>
//             {plan.features.map((f, fi) => (
//               <div key={fi} className="grid grid-cols-4 items-center gap-4">
//                 {isEditing ? (
//                   <>
//                     <Input value={f.text} onChange={(e) => handleFeatureChange(i, fi, 'text', e.target.value)} />
//                     <Switch label='Active' defaultChecked={f.active} onChange={(val) => handleFeatureChange(i, fi, 'active', val)} />
//                     <div className="col-span-2 text-right">
//                       <Button size="icon" variant="outline" onClick={() => removeFeature(i, fi)} startIcon={<Trash2Icon />}>
// 												{" "}
// 											</Button>
//                     </div>
//                   </>
//                 ) : f.active ? (
//                   <div className="col-span-4 text-muted-foreground text-sm">✔ {f.text}</div>
//                 ) : null}
//               </div>
//             ))}
//             {isEditing && <Button onClick={() => addFeature(i)} size="sm" startIcon={<PlusIcon />}>Add Feature</Button>}
//           </div>
//         </div>
//       ))}

//       <div className="text-right">
//         {isEditing ? (
//           <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>Save Changes</Button>
//         ) : (
//           <Button size="md" variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>Edit Pricing</Button>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
import { PlusIcon, Trash2Icon, PencilIcon, SaveIcon } from 'lucide-react';
import Switch from '@/components/form/switch/Switch';

interface PlanFeature {
  id?: number;
  text: string;
  active: boolean;
}

interface PricingPlan {
  id?: number;
  tag: string;
  description: string;
  price: number;
  duration: string;
  ctaText: string;
  ctaUrl: string;
  order: number;
  features: PlanFeature[];
}

interface PricingSection {
  id: number;
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

// Default blank data
const defaultPricingData: PricingSection = {
  id: 0,
  title: '',
  subtitle: '',
  plans: [
    {
      id: 0,
      tag: '',
      description: '',
      price: 0,
      duration: '',
      ctaText: '',
      ctaUrl: '',
      order: 0,
      features: [],
    },
  ],
};

export default function PricingTable() {
  const [data, setData] = useState<PricingSection>(defaultPricingData);
  const [form, setForm] = useState<PricingSection>(defaultPricingData);
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode if you want

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/contents/pricing');
      const json = await res.json();
      setData(json || defaultPricingData);
      setForm(json || defaultPricingData);
    } catch {
      setData(defaultPricingData);
      setForm(defaultPricingData);
    } finally {
      setIsEditing(false);
    }
  };
  fetchData();
}, []);

  const handlePlanChange = <K extends keyof PricingPlan>(index: number, field: K, value: PricingPlan[K]) => {
    const updatedPlans = [...form.plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setForm({ ...form, plans: updatedPlans });
  };

  const handleFeatureChange = <K extends keyof PlanFeature>(planIndex: number, featureIndex: number, field: K, value: PlanFeature[K])  => {
    const updatedPlans = [...form.plans];
    const updatedFeatures = [...updatedPlans[planIndex].features];
    updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], [field]: value };
    updatedPlans[planIndex].features = updatedFeatures;
    setForm({ ...form, plans: updatedPlans });
  };

  const addFeature = (planIndex: number) => {
    const newFeature: PlanFeature = { text: '', active: true };
    const updatedPlans = [...form.plans];
    updatedPlans[planIndex].features.push(newFeature);
    setForm({ ...form, plans: updatedPlans });
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const updatedPlans = [...form.plans];
    updatedPlans[planIndex].features = updatedPlans[planIndex].features.filter((_, i) => i !== featureIndex);
    setForm({ ...form, plans: updatedPlans });
  };

  const addPlan = () => {
    const newPlan: PricingPlan = {
      id: undefined,
      tag: '',
      description: '',
      price: 0,
      duration: '',
      ctaText: '',
      ctaUrl: '',
      order: form.plans.length,
      features: [],
    };
    setForm({ ...form, plans: [...form.plans, newPlan] });
  };

  const handleSave = async () => {
    try {
      await fetch('/api/admin/contents/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setData(form);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900">
        <h2 className="font-semibold text-lg mb-2">Pricing Section</h2>
        {isEditing ? (
          <>
            <TextArea value={form.title ?? ''} onChange={(val) => setForm({ ...form, title: val })} placeholder="Section Title" />
            <TextArea value={form.subtitle ?? ''} onChange={(val) => setForm({ ...form, subtitle: val })} placeholder="Section Subtitle" />
          </>
        ) : (
          <>
            <p className="text-muted-foreground font-medium">{data.title}</p>
            <p className="text-muted-foreground text-sm">{data.subtitle}</p>
          </>
        )}
      </div>

      {form.plans.map((plan, i) => (
        <div key={i} className="border p-6 rounded-lg shadow-sm bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-semibold">Plan #{i + 1}</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input value={plan.tag} placeholder="Tag" onChange={(e) => handlePlanChange(i, 'tag', e.target.value)} />
              <Input value={plan.description} placeholder="Description" onChange={(e) => handlePlanChange(i, 'description', e.target.value)} />
              <Input type="number" value={plan.price} placeholder="Price" onChange={(e) => handlePlanChange(i, 'price', parseFloat(e.target.value))} />
              <Input value={plan.duration} placeholder="Duration" onChange={(e) => handlePlanChange(i, 'duration', e.target.value)} />
              <Input value={plan.ctaText} placeholder="CTA Text" onChange={(e) => handlePlanChange(i, 'ctaText', e.target.value)} />
              <Input value={plan.ctaUrl} placeholder="CTA Url" onChange={(e) => handlePlanChange(i, 'ctaUrl', e.target.value)} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>{plan.tag} - {plan.description}</p>
              <p>${plan.price} / {plan.duration}</p>
              <p>{plan.ctaText} → {plan.ctaUrl}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features</h4>
            {plan.features.map((f, fi) => (
              <div key={fi} className="grid grid-cols-4 items-center gap-4">
                {isEditing ? (
                  <>
                    <Input value={f.text} onChange={(e) => handleFeatureChange(i, fi, 'text', e.target.value)} />
                    <Switch label="Active" defaultChecked={f.active} onChange={(val) => handleFeatureChange(i, fi, 'active', val)} />
                    <div className="col-span-2 text-right">
                      <Button size="icon" variant="outline" onClick={() => removeFeature(i, fi)} startIcon={<Trash2Icon />} >{""}</Button>
                    </div>
                  </>
                ) : f.active ? (
                  <div className="col-span-4 text-muted-foreground text-sm">✔ {f.text}</div>
                ) : null}
              </div>
            ))}
            {isEditing && (
              <Button onClick={() => addFeature(i)} size="sm" startIcon={<PlusIcon />}>
                Add Feature
              </Button>
            )}
          </div>
        </div>
      ))}

      {isEditing && (
        <Button onClick={addPlan} size="sm" variant="outline" startIcon={<PlusIcon />}>
          Add Plan
        </Button>
      )}

      <div className="text-right">
        {isEditing ? (
          <Button size="md" onClick={handleSave} startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        ) : (
          <Button size="md" variant="outline" onClick={() => setIsEditing(true)} startIcon={<PencilIcon />}>
            Edit Pricing
          </Button>
        )}
      </div>
    </div>
  );
}



