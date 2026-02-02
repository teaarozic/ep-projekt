import { useDraggable } from '@dnd-kit/core';
import type { Task } from '@/services/tasksService';
import { Calendar, Clock, Percent } from 'lucide-react';

interface DraggableTaskProps {
  task: Task;
}

export function DraggableTask({ task }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(task.id),
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-xl border border-lime-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <p className="text-xs font-semibold text-lime-700">ID {task.id}</p>
      <p className="mb-2 font-medium text-gray-800">{task.title}</p>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-lime-600" />
          <span>
            {task.startDate
              ? new Date(task.startDate).toLocaleDateString()
              : '-'}
            {' - '}
            {task.endDate ? new Date(task.endDate).toLocaleDateString() : '-'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-lime-600" />
          <span>
            {task.timeSpentHours ?? 0} / {task.estimatedHours ?? 0}h
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Percent className="h-3.5 w-3.5 text-lime-600" />
          <span>{task.progress ?? 0}%</span>
        </div>
      </div>
    </div>
  );
}
