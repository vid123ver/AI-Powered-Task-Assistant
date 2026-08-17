import { useState } from "react";
import type { Task } from "../types/Task";
import ConfirmDialog from "./ConfirmDialog";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task, newTitle: string) => void;
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
}: TaskListProps) {
  const [confirmDeleteId, setConfirmDeleteId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editValue, setEditValue] = useState("");

  const requestDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
    }

    setConfirmDeleteId(null);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (
    task: Task,
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const trimmed = editValue.trim();

    if (!trimmed) {
      return;
    }

    onEdit(task, trimmed);

    setEditingId(null);
    setEditValue("");
  };

  const formatDueDate = (
    dueDate?: string
  ): string | null => {
    if (!dueDate) {
      return null;
    }

    return new Date(
      `${dueDate}T00:00:00`
    ).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                S.No.
              </th>

              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Done
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Task
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Priority
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Due Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Status
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tasks.map((task, index) => {
              const formattedDueDate =
                formatDueDate(task.dueDate);

              return (
                <tr
                  key={task.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-4 py-4 text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        onToggle(task.id)
                      }
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-4">
                    {editingId === task.id ? (
                      <form
                        className="flex gap-2"
                        onSubmit={(event) =>
                          saveEdit(task, event)
                        }
                      >
                        <input
                          type="text"
                          value={editValue}
                          onChange={(event) =>
                            setEditValue(
                              event.target.value
                            )
                          }
                          autoFocus
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                        />
                      </form>
                    ) : (
                      <span
                        className={
                          task.completed
                            ? "text-gray-400 line-through"
                            : "font-medium text-gray-900"
                        }
                      >
                        {task.title}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-700"
                          : task.priority === "medium"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {formattedDueDate ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {formattedDueDate}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        No due date
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        task.completed
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.completed
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {editingId === task.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
                          onClick={(event) =>
                            saveEdit(task, event)
                          }
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          onClick={() =>
                            startEdit(task)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700"
                          onClick={() =>
                            requestDelete(task.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}

export default TaskList;