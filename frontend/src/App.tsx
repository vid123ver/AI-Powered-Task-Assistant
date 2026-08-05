import { useMemo, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import SearchBar from "./components/SearchBar";

function App() {
  const { tasks, isLoading, error, fetchTasks, addTask, toggleTask, deleteTask, editTask } =
    useTasks();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return tasks;
    }

    return tasks.filter((task) => task.title.toLowerCase().includes(term));
  }, [tasks, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return <p className="status-message">Loading...</p>;
    }

    if (tasks.length === 0) {
      return <p className="status-message">No Tasks</p>;
    }

    if (filteredTasks.length === 0) {
      return <p className="status-message">No tasks match "{searchTerm}"</p>;
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
      <h1>Task Management</h1>

      <TaskForm onAddTask={addTask} />

      {!isLoading && tasks.length > 0 && (
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      )}

      {error && (
        <div className="status-message error">
          <p>{error}</p>
          <button onClick={fetchTasks}>Retry</button>
        </div>
      )}

      {renderContent()}
    </div>
  );
}

export default App;