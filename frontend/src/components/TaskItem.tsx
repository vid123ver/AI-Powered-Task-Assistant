import type { Task } from "../types/Task";

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const formattedDueDate = task.dueDate
    ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(
        undefined,
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`font-medium ${
              task.completed
                ? "text-gray-400 line-through"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                task.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.completed ? "Completed" : "Pending"}
            </span>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
              {task.priority}
            </span>

            {formattedDueDate && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Due {formattedDueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;