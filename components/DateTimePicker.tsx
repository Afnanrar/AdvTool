import React, { useMemo } from 'react';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    minDateTime: Date;
}

// Helper to format a date object to YYYY-MM-DD
const toDateString = (date: Date): string => date.toISOString().split('T')[0];

// Helper to format a date object to HH:mm
const toTimeString = (date: Date): string => date.toTimeString().substring(0, 5);


const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, minDateTime }) => {
    // --- State Derivation ---
    // Derive date and time parts from the ISO-like string prop `value`.
    // This ensures the component is always in sync with its parent.
    const { date: selectedDateStr, time: selectedTimeStr } = useMemo(() => {
        if (value && value.includes('T')) {
            const [date, time] = value.split('T');
            return { date, time: time.substring(0, 5) };
        }
        return { date: '', time: '' };
    }, [value]);

    // --- Minimum Date/Time Calculation ---
    // Calculate the minimum allowed date and time based on the `minDateTime` prop.
    const minDateStr = useMemo(() => toDateString(minDateTime), [minDateTime]);
    
    const minTimeStr = useMemo(() => {
        // If the selected date is the same as the minimum date (i.e., today),
        // the minimum time is the current time. Otherwise, there's no min time.
        if (selectedDateStr === minDateStr) {
            return toTimeString(minDateTime);
        }
        return '';
    }, [selectedDateStr, minDateStr, minDateTime]);


    // --- Validation ---
    // Determine if the currently selected date/time is in the past.
    const isPastDateTime = useMemo(() => {
        if (!selectedDateStr || !selectedTimeStr) return false;

        const selectedDateTime = new Date(`${selectedDateStr}T${selectedTimeStr}:00`);
        // Add a 1-minute buffer to prevent validation errors due to slight delays.
        return selectedDateTime.getTime() < minDateTime.getTime() - 60000;
    }, [selectedDateStr, selectedTimeStr, minDateTime]);

    // --- Event Handlers ---
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        // If time is already set, update the full value. Otherwise, clear it as time needs re-selection.
        onChange(selectedTimeStr ? `${newDate}T${selectedTimeStr}` : '');
    };
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        // Time can only be set if a date is already selected.
        if (selectedDateStr) {
            onChange(`${selectedDateStr}T${newTime}`);
        }
    };

    // --- Dynamic Styling ---
    const inputClasses = "bg-slate-200 dark:bg-slate-700 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none disabled:opacity-50 transition-shadow";
    const invalidClasses = "ring-2 ring-inset ring-red-500";
    const validClasses = "focus:ring-2 focus:ring-inset focus:ring-blue-500";
    const commonInvalidClass = isPastDateTime ? invalidClasses : validClasses;
    const iconColorClass = isPastDateTime ? 'text-red-500' : 'text-slate-400 dark:text-slate-500';

    return (
        <div>
            <div className="flex items-center space-x-2">
                {/* Date Input */}
                <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${iconColorClass}`}>
                        <CalendarIcon />
                    </div>
                    <input
                        type="date"
                        value={selectedDateStr}
                        onChange={handleDateChange}
                        min={minDateStr}
                        className={`${inputClasses} ${commonInvalidClass}`}
                        aria-label="Schedule Date"
                    />
                </div>
                {/* Time Input */}
                <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${iconColorClass}`}>
                        <ClockIcon />
                    </div>
                    <input
                        type="time"
                        value={selectedTimeStr}
                        onChange={handleTimeChange}
                        min={minTimeStr}
                        disabled={!selectedDateStr} // Can't select time without a date
                        className={`${inputClasses} ${commonInvalidClass}`}
                        aria-label="Schedule Time"
                    />
                </div>
            </div>
            {isPastDateTime && (
                <p className="text-xs text-red-500 mt-2">Cannot schedule in the past.</p>
            )}
        </div>
    );
};

export default DateTimePicker;
