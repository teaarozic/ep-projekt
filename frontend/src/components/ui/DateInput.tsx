'use client';

import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface DateInputProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700',
        'transition-colors focus:border-lime-500 focus:ring-2 focus:ring-lime-500 focus:ring-offset-1'
      )}
    >
      <span className={value ? 'text-gray-800' : 'text-gray-400'}>
        {value || placeholder || 'Select date'}
      </span>
      <Calendar className="ml-2 h-4 w-4 text-gray-500" />
    </button>
  )
);
CustomInput.displayName = 'CustomInput';

export function DateInput({ selected, onChange, placeholder }: DateInputProps) {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        customInput={<CustomInput />}
        popperPlacement="bottom-start"
        popperClassName="z-50"
        calendarClassName="rounded-md border border-gray-200 shadow-lg p-2 bg-white text-sm text-gray-700"
        dayClassName={(date) =>
          cn(
            'rounded-md p-1 hover:bg-lime-100 transition',
            selected?.toDateString() === date.toDateString()
              ? 'bg-lime-500 text-white hover:bg-lime-600'
              : ''
          )
        }
      />
    </div>
  );
}
