import { useMemo, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import SearchBar from "./components/SearchBar";
import ChatPage from "./components/Chat/ChatPage";

function App() {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  } = useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState<"tasks" | "chat">("tasks");

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return tasks;
    }

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(term)
    );
  }, [tasks, searchTerm]);

  const renderTaskContent = () => {
    if (isLoading) {
      return <p className="status-message">Loading...</p>;
    }

    if (tasks.length === 0) {
      return <p className="status-message">No Tasks</p>;
    }

    if (filteredTasks.length === 0) {
      return (
        <p className="status-message">
          No tasks match "{searchTerm}"
        </p>
      );
    }

    return (
      <TaskList
        tasks={filteredTasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
      />
    );
  };

  return (
    <div className="container">

      {/* Navigation */}

      <nav className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1.5">

        <button
          type="button"
          onClick={() => setPage("tasks")}
          className={`!m-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            page === "tasks"
              ? "!bg-gray-900 !text-white shadow-sm"
              : "!bg-transparent !text-gray-600 hover:!bg-white hover:!text-gray-900"
          }`}
        >
          Tasks
        </button>

        <button
          type="button"
          onClick={() => setPage("chat")}
          className={`!m-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            page === "chat"
              ? "!bg-gray-900 !text-white shadow-sm"
              : "!bg-transparent !text-gray-600 hover:!bg-white hover:!text-gray-900"
          }`}
        >
          AI Assistant
        </button>

      </nav>

      {/* Tasks Page */}

      {page === "tasks" ? (
        <>
          <h1>Task Management</h1>

          <TaskForm onAddTask={addTask} />

          {!isLoading && tasks.length > 0 && (
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          )}

          {error && (
            <div className="status-message error">
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchTasks}
              >
                Retry
              </button>
            </div>
          )}

          {renderTaskContent()}
        </>
      ) : (
        /* Chat Page */

        <ChatPage
          onTasksChanged={fetchTasks}
        />
      )}
    </div>
  );
}

export default App;