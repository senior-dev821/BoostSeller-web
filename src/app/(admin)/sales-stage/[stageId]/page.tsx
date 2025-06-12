
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

import ComponentCard from "@/components/common/ComponentCard";
import StageDetailForm from "@/components/sales-stage/StageDetailForm";
import { Metadata } from "next";
import React from "react";

const JWT_SECRET = process.env.JWT_SECRET || 'BoostSellerSecret';

export const metadata: Metadata = {
    title: "Sales Stages detail | BoostSeller",
    description: "This is Sales Stage Detail page for BoostSeller Admin Dashboard",
};

export default async function SalesStageDetailPage({ params }: { params: { stageId: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.log("Error:", error);
        redirect('/login');
    }

    const { stageId } = params;

    return (
        <div className="space-y-6">
            <ComponentCard title="Sales Stage Detail">
                {/* 🔥 Pass stageId to the component */}
                <StageDetailForm stageId={stageId} />
            </ComponentCard>
        </div>
    );
}

