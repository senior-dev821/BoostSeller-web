// app/(admin)/cms/page.tsx
'use client';

import ComponentCard from "@/components/common/ComponentCard";
import CustomTabs from '@/components/ui/CustomTabs';
import HeroTable from '@/components/cms/HeroTable';
import FeaturesTable from '@/components/cms/FeaturesTable';
import WorkingStepsTable from "@/components/cms/WorkingStepsTable";
import AboutTable from '@/components/cms/AboutTable';
import ContactTable from "@/components/cms/ContactTable";
import PricingTable from '@/components/cms/PricingTable';
import TermsTable from "@/components/cms/TermsTable";
import PolicyTable from "@/components/cms/PolicyTable";
import TeamSectionTable from "@/components/cms/TeamSectionTable";
import TestimonialsTable from "@/components/cms/TestimonialsTable";
// Add more as needed

export default function CmsDashboard() {

	const tabs = [
    { key: 'hero', label: 'Hero Section', content: <HeroTable /> },
    { key: 'features', label: 'Features', content: <FeaturesTable /> },
		{ key: 'workingsteps', label: 'Working Steps', content: <WorkingStepsTable />},
		{ key: 'abouttable', label: 'About Section', content: <AboutTable />},
		{ key: 'teamtable', label: 'Our Team', content: <TeamSectionTable />},
		{ key: 'testimonialstable', label: 'Testimonials', content: <TestimonialsTable />},
		{ key: 'pricingtable', label: 'Pricing', content: <PricingTable />},
		{ key: 'contacttable', label: 'Contact', content: <ContactTable />},
		{ key: 'termstable', label: 'Terms of Use', content: <TermsTable />},
		{ key: 'policytable', label: 'Privacy Policy', content: <PolicyTable />}
    // Add more tabs here
  ];
  return (
    <div className="p-6">
			<ComponentCard title="Content Management">
				<CustomTabs tabs={tabs} />
			</ComponentCard>		
    </div>
  );
}
