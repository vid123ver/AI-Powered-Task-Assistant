import type { ChatAction } from "../../types/Chat";

interface ActionCardProps {
  action: ChatAction;
}

function ActionCard({ action }: ActionCardProps) {
  const getActionTitle = () => {
    switch (action.type) {
      case "create_task":
        return "Created task";

      case "update_task":
        return "Updated task";

      case "delete_task":
        return "Deleted task";

      case "list_tasks":
        return "Listed tasks";

      default:
        return "Task action";
    }
  };

  const getActionDetails = () => {
    if (action.task) {
      return action.task.title;
    }

    if (action.count !== undefined) {
      return `${action.count} task${action.count === 1 ? "" : "s"} found`;
    }

    return "";
  };

  return (
    <div className="mt-2 max-w-[80%] rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <span className="text-green-600">✓</span>

        <div>
          <p className="text-sm font-medium">
            {getActionTitle()}
          </p>

          {getActionDetails() && (
            <p className="mt-1 text-sm text-gray-500">
              {getActionDetails()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActionCard;