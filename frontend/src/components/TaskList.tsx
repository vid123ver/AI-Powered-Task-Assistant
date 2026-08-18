import type { Task } from "../types/Task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    task: Task,
    updates: {
      title: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    }
  ) => void;
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
}: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default TaskList;