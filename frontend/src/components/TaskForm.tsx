import { useState } from "react";

interface TaskFormProps {
  onAddTask: (
    title: string,
    dueDate?: string
  ) => Promise<void>;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    await onAddTask(
      title.trim(),
      dueDate || undefined
    );

    setTitle("");
    setDueDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label
          htmlFor="task-title"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Task
        </label>

        <input
          id="task-title"
          type="text"
          placeholder="Enter task..."
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <div>
        <label
          htmlFor="task-due-date"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Due date
        </label>

        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200 sm:w-auto"
        />
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;