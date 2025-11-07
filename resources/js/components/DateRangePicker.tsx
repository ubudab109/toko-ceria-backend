import React, { useState } from "react";

interface DateRangePickerProps {
    label: string;
    startDate?: string;
    endDate?: string;
    onChange: (range: { startDate?: string; endDate?: string }) => void;
    visible?: boolean;
}

export default function DateRangePicker({
    label,
    startDate,
    endDate,
    onChange,
    visible = true,
}: DateRangePickerProps) {
    const [start, setStart] = useState(startDate || "");
    const [end, setEnd] = useState(endDate || "");

    if (!visible) return null;

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStart(e.target.value);
        onChange({ startDate: e.target.value, endDate: end });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnd(e.target.value);
        onChange({ startDate: start, endDate: e.target.value });
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{label}:</label>
            <input
                type="date"
                value={start}
                onChange={handleStartChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
                type="date"
                value={end}
                onChange={handleEndChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
        </div>
    );
}
