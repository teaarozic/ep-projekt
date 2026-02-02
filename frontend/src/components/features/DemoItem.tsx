'use client';

import { Button } from '@/components/ui/Button';

interface Task {
  text: string;
  done: boolean;
}

interface DemoItemProps {
  task: Task;
  index: number;
  toggleTask: (index: number) => void;
  deleteTask: (index: number) => void;
}

export default function DemoItem({
  task,
  index,
  toggleTask,
  deleteTask,
}: DemoItemProps) {
  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        aria-label={`Toggle "${task.text}"`}
        checked={task.done}
        onChange={() => toggleTask(index)}
        className="h-4 w-4"
      />
      <span className={task.done ? 'text-muted-foreground line-through' : ''}>
        {task.text}
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => deleteTask(index)}
        className="ml-auto"
      >
        Delete
      </Button>
    </li>
  );
}
