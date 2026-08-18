import { useState } from "react";
import type { Task } from "../types/Task";
import ConfirmDialog from "./ConfirmDialog";

interface TaskItemProps {
  task: Task;
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

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<
    "low" | "medium" | "high"
  >(task.priority);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ?? ""
  );
  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const formattedDueDate = task.dueDate
    ? new Date(
        `${task.dueDate}T00:00:00`
      ).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const startEdit = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
    setIsEditing(false);
  };

  const saveEdit = () => {
    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    onEdit(task, {
      title: trimmedTitle,
      priority: editPriority,
      dueDate: editDueDate || undefined,
    });

    setIsEditing(false);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    setShowDeleteDialog(false);
  };

  const priorityStyles = {
    high: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    medium:
      "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    low: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  };

  return (
    <>
      <article
        className={`rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:shadow-md ${
          task.completed
            ? "border-gray-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor={`task-title-${task.id}`}
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Task title
              </label>

              <input
                id={`task-title-${task.id}`}
                type="text"
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`task-priority-${task.id}`}
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>

                <select
                  id={`task-priority-${task.id}`}
                  value={editPriority}
                  onChange={(event) =>
                    setEditPriority(
                      event.target.value as
                        | "low"
                        | "medium"
                        | "high"
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`task-due-date-${task.id}`}
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Due date
                </label>

                <input
                  id={`task-due-date-${task.id}`}
                  type="date"
                  value={editDueDate}
                  onChange={(event) =>
                    setEditDueDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="!m-0 !rounded-lg !border !border-gray-300 !bg-white !px-4 !py-2 !text-sm !font-medium !text-gray-700 hover:!bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={!editTitle.trim()}
                className="!m-0 !rounded-lg !bg-gray-900 !px-4 !py-2 !text-sm !font-medium !text-white hover:!bg-gray-800 disabled:!cursor-not-allowed disabled:!opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                aria-label={
                  task.completed
                    ? "Mark task as pending"
                    : "Mark task as completed"
                }
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  task.completed
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-transparent hover:border-gray-500"
                }`}
              >
                {task.completed && (
                  <span className="text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3
                      className={`break-words text-base font-semibold ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          task.completed
                            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                            : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200"
                        }`}
                      >
                        {task.completed
                          ? "Completed"
                          : "Pending"}
                      </span>

                      {formattedDueDate && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                          Due {formattedDueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={startEdit}
                      className="!m-0 !rounded-lg !border !border-gray-300 !bg-white !px-3 !py-2 !text-xs !font-medium !text-gray-700 transition hover:!bg-gray-50 hover:!text-gray-900"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowDeleteDialog(true)
                      }
                      className="!m-0 !rounded-lg !bg-red-600 !px-3 !py-2 !text-xs !font-medium !text-white transition hover:!bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </article>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        message={`Are you sure you want to delete "${task.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() =>
          setShowDeleteDialog(false)
        }
      />
    </>
  );
}

export default TaskItem;