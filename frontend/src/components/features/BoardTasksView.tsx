'use client';

import { DndContext } from '@dnd-kit/core';
import type { Task } from '@/services/tasksService';
import { DraggableTask } from '@/components/features/DraggableTask';
import { useDroppable } from '@dnd-kit/core';

interface BoardTasksViewProps {
  tasks: Task[];
  onMoveTask: (taskId: number, newStatus: string) => void;
}

const columns = [
  { key: 'To do', label: 'TO DO', color: 'bg-gray-200' },
  { key: 'Blocked', label: 'BLOCKED', color: 'bg-red-200' },
  { key: 'In progress', label: 'IN PROGRESS', color: 'bg-lime-200' },
  { key: 'QA', label: 'QA', color: 'bg-yellow-200' },
  { key: 'Done', label: 'DONE', color: 'bg-blue-200' },
];

function Column({
  column,
  children,
}: {
  column: { key: string; label: string; color: string };
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
  });

  return (
    <div ref={setNodeRef}>
      <div
        className={`${column.color} mb-3 rounded-full px-3 py-1 text-center text-xs font-semibold text-gray-700`}
      >
        {column.label}
      </div>

      <div
        className={`min-h-[200px] space-y-3 rounded-lg p-2 transition ${
          isOver ? 'border border-lime-400 bg-lime-50' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function BoardTasksView({
  tasks,
  onMoveTask,
}: BoardTasksViewProps) {
  return (
    <DndContext
      onDragEnd={(event) => {
        if (!event.over) return;

        const taskId = Number(event.active.id);
        const newStatus = String(event.over.id);

        onMoveTask(taskId, newStatus);
      }}
    >
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-5">
        {columns.map((column) => {
          const items = tasks.filter((t) => t.status === column.key);

          return (
            <Column key={column.key} column={column}>
              {items.length === 0 ? (
                <p className="text-center text-sm italic text-gray-400">
                  No tasks
                </p>
              ) : (
                items.map((task) => <DraggableTask key={task.id} task={task} />)
              )}
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
}
