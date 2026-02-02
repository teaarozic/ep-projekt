'use client';

import { Select, SelectContent, SelectItem } from '@/components/ui/Select';
import { Filter } from 'lucide-react';
import { FilterSelectTrigger } from '@/components/ui/FilterSelectTrigger';

interface Option {
  value: string;
  label: string;
}

interface TasksFilterBarProps {
  statuses: Option[];
  projects: Option[];
  clients: Option[];
  assignees: Option[];
  selected: {
    status?: string;
    project?: string;
    client?: string;
    assignee?: string;
    timeRange?: string;
  };
  onChange: (name: string, value: string) => void;
  showAssignee?: boolean;
}

export default function TasksFilterBar({
  statuses,
  projects,
  clients,
  assignees,
  selected,
  onChange,
  showAssignee = true,
}: TasksFilterBarProps) {
  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
  ];

  const renderSelect = (name: string, label: string, options: Option[]) => {
    const raw = selected[name as keyof typeof selected];
    const active = raw !== undefined && raw !== '' && raw !== 'all';

    return (
      <Select
        value={selected[name as keyof typeof selected] || 'all'}
        onValueChange={(v) => onChange(name, v)}
      >
        <FilterSelectTrigger active={active}>
          <span className="text-sm font-medium">{label}</span>
        </FilterSelectTrigger>

        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="mt-2 flex w-full items-center justify-start gap-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 shadow-sm">
      <div className="flex items-center text-lime-600">
        <Filter className="h-4 w-4" />
      </div>

      {renderSelect('status', 'Status', statuses)}
      {renderSelect('project', 'Project', projects)}
      {renderSelect('client', 'Client', clients)}
      {renderSelect('timeRange', 'Time', timeRanges)}
      {showAssignee && renderSelect('assignee', 'Assignee', assignees)}
    </div>
  );
}
