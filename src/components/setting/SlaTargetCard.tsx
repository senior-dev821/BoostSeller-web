'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label"

export default function SlaTargetCard() {
    const [sla, setSla] = useState<number | string>(0);
    const [saving, setSaving] = useState(false);
    const [initialSla, setInitialSla] = useState(0);

    // Fetch setting on load
    useEffect(() => {
        fetch('/api/setting/sla')
            .then((res) => res.json())
            .then((data) => {
                const value = data.slaTarget;
                setSla(value);
                setInitialSla(value);
            });
    }, []);

    const handleSave = async () => {
        if (sla === initialSla) return;
        setSaving(true);

        const res = await fetch('/api/setting/sla', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slaTarget: sla }),
        });

        await res.json();
        setInitialSla(Number(sla));
        setSaving(false);
    };

    const hasChanges = sla !== initialSla;


    return (
        <Card className="w-full max-w-md p-6 shadow-xl">
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">SLA Target</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Set the maximum time (in seconds) allowed for a performer to respond to a new lead.
                </p>

                <div className="space-y-2">
                    <Label htmlFor="limit">Response Time Limit (seconds)</Label>
                    <Input
                        id="limit"
                        type="number"
                        min="0"
                        value={sla}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSla(value === '' ? '' : Number(value));
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
