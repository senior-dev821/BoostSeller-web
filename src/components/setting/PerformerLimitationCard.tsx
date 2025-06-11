'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label"

export default function PerformerLimitationCard() {
  const [limit, setLimit] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);
	const [initialLimit, setInitialLimit] = useState(0);

  // Fetch setting on load
  useEffect(() => {
    fetch('/api/setting/performerlimitation')
      .then((res) => res.json())
      .then((data) => {
        const value = data.performLimit || 0;
        setLimit(value);
        setInitialLimit(value);
      });
  }, []);

	const handleSave = async () => {
    if (limit === initialLimit) return;
    setSaving(true);

    const res = await fetch('/api/setting/performerlimitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ performLimit: limit }),
    });

    await res.json();
    setInitialLimit(Number(limit)); // update saved state
    setSaving(false);
  };

  const hasChanges = limit !== initialLimit;
  

  return (
    <Card className="w-full max-w-md p-6 shadow-xl">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Performer Limitation</h2>
        </div>
        <p className="text-sm text-muted-foreground">
				Sets the maximum number of leads a performer can work with at the same time.
        </p>

        <div className="space-y-2">
          <Label htmlFor="limit">Maximum Number</Label>
          <Input
            id="limit"
            type="number"
            min="0"
            value={limit}
            onChange={(e) => {
              const value = e.target.value;
              setLimit(value === '' ? '' : Number(value));
            }}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          variant={hasChanges ? 'primary' : 'outline'}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
