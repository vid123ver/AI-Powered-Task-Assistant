import { useState } from "react";
import type { Task } from "../types/Task";
import ConfirmDialog from "./ConfirmDialog";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task, newTitle: string) => void;
}

function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const saveEdit = (task: Task, e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = editValue.trim();
    if (!trimmed) return;

    onEdit(task, trimmed);
    setEditingId(null);
    setEditValue("");
  };

  return (
    <>
      <table className="task-table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Done</th>
            <th>Task</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td data-label="S.No.">{index + 1}</td>

              <td data-label="Done">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                />
              </td>

              <td data-label="Task">
                {editingId === task.id ? (
                  <form className="edit-form" onSubmit={(e) => saveEdit(task, e)}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  </form>
                ) : (
                  task.title
                )}
              </td>

              <td data-label="Status">
                <span className={task.completed ? "completed-badge" : "pending-badge"}>
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </td>

              <td data-label="Actions">
                {editingId === task.id ? (
                  <>
                    <button className="edit-btn" onClick={(e) => saveEdit(task, e)}>
                      Save
                    </button>
                    <button className="delete-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => requestDelete(task.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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