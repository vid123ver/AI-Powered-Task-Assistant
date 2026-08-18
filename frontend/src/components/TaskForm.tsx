import { useState } from "react";

interface TaskFormProps {
  onAddTask: (
    title: string,
    dueDate?: string,
    priority?: "low" | "medium" | "high"
  ) => Promise<void>;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high"
  >("medium");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter a task title.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onAddTask(
        trimmedTitle,
        dueDate || undefined,
        priority
      );

      setTitle("");
      setDueDate("");
      setPriority("medium");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create the task. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">
          Create New Task
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Add a task and organize it with priority and a due date.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="task-title"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Task title
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="e.g. Fix login authentication bug"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);

              if (error) {
                setError("");
              }
            }}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Priority
          </label>

          <select
            id="task-priority"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as
                  | "low"
                  | "medium"
                  | "high"
              )
            }
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <span className="font-semibold">!</span>

          <p className="m-0">
            {error}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="!m-0 !rounded-lg !bg-gray-900 !px-5 !py-2.5 !text-sm !font-medium !text-white transition hover:!bg-gray-800 disabled:!cursor-not-allowed disabled:!opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;