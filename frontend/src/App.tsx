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
      <nav className="flex gap-3 border-b pb-4 mb-6">
        <button
          onClick={() => setPage("tasks")}
          className="rounded-lg border px-4 py-2"
        >
          Tasks
        </button>

        <button
          onClick={() => setPage("chat")}
          className="rounded-lg border px-4 py-2"
        >
          AI Assistant
        </button>
      </nav>

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
              <button onClick={fetchTasks}>Retry</button>
            </div>
          )}

          {renderTaskContent()}
        </>
      ) : (
          <ChatPage onTasksChanged={fetchTasks} />
      )}
    </div>
  );
}

export default App;