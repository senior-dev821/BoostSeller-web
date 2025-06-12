'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  stageId: string;
};

type SalesStage = {
  id: string;
  name: string;
  status: string;
  // ... add other fields you need
};

const StageDetailForm: React.FC<Props> = ({ stageId }) => {
  const [stage, setStage] = useState<SalesStage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStageDetail = async () => {
      try {
        const res = await fetch(`/api/sales-stage/${stageId}`);
        const data = await res.json();
        setStage(data);
      } catch (err) {
        console.error('Failed to fetch stage', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStageDetail();
  }, [stageId]);

  if (loading) return <div>Loading...</div>;
  if (!stage) return <div>Sales stage not found</div>;

  return (
    <div className="space-y-4">
      <div>
        <strong>ID:</strong> {stage.id}
      </div>
      <div>
        <strong>Name:</strong> {stage.name}
      </div>
      <div>
        <strong>Status:</strong> {stage.status}
      </div>
      {/* Add more fields or editable form here */}
    </div>
  );
};

export default StageDetailForm;
