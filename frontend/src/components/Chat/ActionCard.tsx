import type { ChatAction } from "../../types/Chat";

interface ActionCardProps {
  action: ChatAction;
}

function ActionCard({ action }: ActionCardProps) {
  const getActionTitle = () => {
    switch (action.type) {
      case "create_task":
        return "Task created";

      case "update_task":
        return "Task updated";

      case "delete_task":
        return "Task deleted";

      case "list_tasks":
        return "Tasks retrieved";

      default:
        return "Task action";
    }
  };

  const getActionDetails = () => {
    if (action.task) {
      return action.task.title;
    }

    if (action.count !== undefined) {
      return `${action.count} task${
        action.count === 1 ? "" : "s"
      } found`;
    }

    return "";
  };

  const getActionIcon = () => {
    switch (action.type) {
      case "create_task":
        return "+";

      case "update_task":
        return "↻";

      case "delete_task":
        return "×";

      case "list_tasks":
        return "☷";

      default:
        return "✓";
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 px-4 py-3">

        {/* Icon */}

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white">
          {getActionIcon()}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <p className="!mb-0 text-xs font-medium uppercase tracking-wide text-gray-400">
            AI Action
          </p>

          <p className="!mb-0 mt-0.5 text-sm font-semibold text-gray-800">
            {getActionTitle()}
          </p>

          {getActionDetails() && (
            <p className="!mb-0 mt-0.5 truncate text-sm text-gray-500">
              {getActionDetails()}
            </p>
          )}

        </div>

        {/* Status */}

        <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1">

          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

          <span className="text-[11px] font-medium text-gray-600">
            Done
          </span>

        </div>

      </div>

    </div>
  );
}

export default ActionCard;