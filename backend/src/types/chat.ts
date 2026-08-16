export type ChatActionType =
  | "create_task"
  | "update_task"
  | "delete_task"
  | "list_tasks";

export interface ChatAction {
  type: ChatActionType;
  task?: {
    id: string;
    title: string;
  };
  count?: number;
}