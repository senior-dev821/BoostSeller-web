'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label"
import { Info } from 'lucide-react';

export default function LeadEscalationCard() {
  const [timeout, setTimeout] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
	const [initialTimeout, setInitialTimeout] = useState(0);

  // Fetch setting on load
  useEffect(() => {
    fetch('/api/setting/escalationtime')
      .then((res) => res.json())
      .then((data) => {
        const value = data.assignPeriod || 0;
        setTimeout(value);
        setInitialTimeout(value);
        setLoading(false);
      });
  }, []);

	const handleSave = async () => {
    if (timeout === initialTimeout) return;
    setSaving(true);

    const res = await fetch('/api/setting/escalationtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignPeriod: timeout }),
    });

    await res.json();
    setInitialTimeout(timeout); // update saved state
    setSaving(false);
  };

  const hasChanges = timeout !== initialTimeout;
  
	if (loading) return <p className="text-center">Loading...</p>;

  return (
    <Card className="w-full max-w-md p-6 shadow-xl">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Lead Escalation Timeout</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Set the time (in seconds) after which an unclaimed lead will be escalated.
        </p>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (seconds)</Label>
          <Input
            id="timeout"
            type="number"
            min="0"
            defaultValue={timeout}
            onChange={(e) => setTimeout(Number(e.target.value))}
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
