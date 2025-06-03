// components/DateRangePicker.tsx
'use client';

import { DateRange } from 'react-date-range';
import { useState } from 'react';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DateRangePicker({ onChange }: { onChange?: (range: any) => void }) {
  const [range, setRange] = useState([
    {
      startDate: addDays(new Date(), -7),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const handleSelect = (ranges: any) => {
    setRange([ranges.selection]);
    onChange?.(ranges.selection);
  };

  return (
    <div className="border rounded-xl shadow p-4 bg-white w-fit">
      <DateRange
        editableDateInputs
        onChange={handleSelect}
        moveRangeOnFirstSelection={false}
        ranges={range}
      />
    </div>
  );
}