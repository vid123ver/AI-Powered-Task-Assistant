# AI-Powered Task Assistant

A Task Management app (React + Express + TypeScript, extended from Assignment 1) with an AI assistant layered on top, built two ways:

1. **`POST /chat`** — a backend endpoint where Google Gemini manages tasks via function calling, used by the in-app chat page.
2. **A standalone MCP server** — the same task tools exposed over the Model Context Protocol, usable from any MCP client (tested with Claude Desktop).

> **Status: Phases 1, 2, and 3 complete.** The frontend has a full AI Assistant chat page (in the nav) alongside the original task list. Both the in-app chat and Claude Desktop (via the MCP server) can manage tasks end-to-end, including optional due dates.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Backend REST API](#backend-rest-api)
- [POST /chat](#post-chat)
- [MCP Server](#mcp-server)
- [Connecting the MCP Server to Claude Desktop](#connecting-the-mcp-server-to-claude-desktop)
- [Tools Exposed](#tools-exposed)
- [Example Prompts](#example-prompts)

---

## Project Structure

```
AI-Powered-Task-Assistant/
├── .gitignore
├── .vscode/
│   └── settings.json
├── Assignment3_Phase-1.postman_collection.json
├── README.md
├── package.json
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── ai/
│       │   ├── systemInstruction.ts     # Gemini system prompt / rules
│       │   └── tools.ts                 # Gemini function declarations (4 tools)
│       ├── config/
│       │   └── gemini.ts                # Gemini client setup
│       ├── controllers/
│       │   ├── chatController.ts        # POST /chat handler
│       │   └── taskController.ts        # /tasks CRUD handlers
│       ├── data/
│       │   └── tasks.json               # file-based task store
│       ├── middlewares/
│       │   ├── apiAuth.ts               # bearer token auth
│       │   ├── chatValidation.ts        # validates /chat request body
│       │   ├── errorHandler.ts
│       │   └── notFound.ts
│       ├── models/
│       │   └── Task.ts                  # Task type (id, title, completed, priority, dueDate)
│       ├── repositories/
│       │   └── taskRepository.ts        # reads/writes tasks.json
│       ├── routes/
│       │   ├── chatRoutes.ts
│       │   └── taskRoutes.ts
│       ├── services/
│       │   ├── geminiService.ts         # tool-call loop, session management
│       │   └── taskService.ts           # task CRUD logic
│       ├── types/
│       │   └── chat.ts                  # ChatAction / ChatActionType types
│       └── utils/
│           ├── AppError.ts
│           ├── asyncHandler.ts
│           ├── dateUtils.ts             # due-date parsing/validation (today/tomorrow/weekday/ISO)
│           └── taskValidator.ts
│
├── frontend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/
│       │   ├── api.ts                   # axios instance (base URL + bearer token)
│       │   ├── taskApi.ts
│       │   └── chatApi.ts
│       ├── components/
│       │   ├── ConfirmDialog.tsx
│       │   ├── SearchBar.tsx
│       │   ├── TaskForm.tsx             # includes due date input
│       │   ├── TaskItem.tsx             # displays due date
│       │   ├── TaskList.tsx
│       │   └── Chat/
│       │       ├── ChatPage.tsx         # chat UI, message list, sessionStorage persistence
│       │       └── ActionCard.tsx       # inline "Task created/updated/deleted" card
│       ├── hooks/
│       │   └── useTasks.ts
│       └── types/
│           ├── Task.ts                  # includes dueDate?: string
│           └── Chat.ts
│
└── mcp-server/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── server.ts                    # registers all 6 tools, starts stdio transport
        ├── services/
        │   └── taskApi.ts               # HTTP client to backend /tasks (base URL + bearer token, both env-configurable)
        └── tools/
            ├── createTask.ts            # accepts optional dueDate
            ├── listTasks.ts
            ├── updateTask.ts            # accepts optional dueDate
            ├── deleteTask.ts
            ├── getTaskSummary.ts
            └── searchTasks.ts
```

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in GEMINI_API_KEY and TASK_API_TOKEN (see below)
npm run dev
```

Runs on `http://localhost:5001` by default (set by `PORT` in `.env.example`).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_API_BASE_URL and VITE_TASK_API_TOKEN
npm run dev
```

### 3. MCP Server

```bash
cd mcp-server
npm install
cp .env.example .env   # TASK_API_TOKEN and TASK_API_BASE_URL — must match the backend
npm run build
```

---

## Environment Variables

**backend/.env**
```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
PORT=5001
TASK_API_TOKEN=some-shared-secret
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5001
VITE_TASK_API_TOKEN=some-shared-secret
```

**mcp-server/.env**
```
TASK_API_TOKEN=some-shared-secret          # must match the backend's TASK_API_TOKEN
TASK_API_BASE_URL=http://localhost:5001    # must match the backend's PORT
```

`TASK_API_TOKEN` is required by the backend's `/tasks` routes (bearer auth) — both the frontend and the MCP server authenticate with it. Without it set on the backend, every `/tasks` request returns `500 Server authentication token is not configured`. `TASK_API_BASE_URL` tells the MCP server where the backend lives — it falls back to `http://localhost:5001` if unset, but should be set explicitly if the backend runs on a different port or host. No `.env` file is committed — only `.env.example` templates are.

---

## Backend REST API

All `/tasks` routes require `Authorization: Bearer <TASK_API_TOKEN>`.

| Method | Route         | Description              |
|--------|---------------|---------------------------|
| GET    | `/tasks`      | List all tasks            |
| GET    | `/tasks/:id`  | Get one task               |
| POST   | `/tasks`      | Create a task (`title` required, optional `priority`, optional `dueDate`) |
| PUT    | `/tasks/:id`  | Update a task (`title`, `completed`, `priority`, `dueDate` — all optional, at least one required) |
| PATCH  | `/tasks/:id`  | Toggle completion          |
| DELETE | `/tasks/:id`  | Delete a task               |

**`dueDate` format:** accepts an ISO date (`2026-08-25`), `"today"`, `"tomorrow"`, or a weekday name (`"Friday"` — resolves to the next upcoming occurrence of that weekday). Invalid values return `400 Invalid due date`. Parsing/validation lives in `backend/src/utils/dateUtils.ts` and is shared by the REST API, `/chat`, and the MCP server.

## POST /chat

```json
// request
{ "sessionId": "abc-123", "message": "create a high priority task to fix the login bug, due Friday" }

// response
{
  "success": true,
  "reply": "I've created the task \"fix the login bug\" with high priority, due Friday.",
  "actions": [
    { "type": "create_task", "task": { "id": "…", "title": "fix the login bug", "priority": "high", "dueDate": "2026-08-21" } }
  ]
}
```

`sessionId` keeps a Gemini `Chat` session (with history) alive in memory per session, so follow-ups like "now mark it as done" or "push the due date to next Monday" work without resending prior turns. Sessions are in-memory only and reset on server restart.

---

## MCP Server

Runs over **stdio transport**, built with `@modelcontextprotocol/sdk` and `zod` for input schemas. It doesn't talk to Gemini — it calls the backend's `/tasks` REST API with the bearer token from `TASK_API_TOKEN`, at the base URL from `TASK_API_BASE_URL`.

### Connecting the MCP Server to Claude Desktop

Add to your Claude Desktop MCP config (see modelcontextprotocol.io for the exact file location for your OS):

```json
{
  "mcpServers": {
    "task-management-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/server.js"],
      "env": {
        "TASK_API_TOKEN": "some-shared-secret",
        "TASK_API_BASE_URL": "http://localhost:5001"
      }
    }
  }
}
```

Make sure the backend is running first, then restart Claude Desktop.

---

## Tools Exposed

**Via `/chat` (Gemini function calling, 4 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task` — `create_task` and `update_task` both accept an optional `dueDate`.

**Via MCP server (6 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task`, `get_task_summary`, `search_tasks` — `create_task` and `update_task` both accept an optional `dueDate`.

Each tool returns structured data (e.g. `create_task` returns the created task's `id`, `title`, `completed`, `priority`, and `dueDate` — not just a success flag).

---

## Example Prompts

Tried against both the `/chat` UI and Claude Desktop (via MCP):

- `"create a high priority task to fix the login bug, due Friday"`
- `"show me all my tasks"`
- `"mark the login bug task as done"`
- `"change the due date on that task to tomorrow"`
- `"delete all completed tasks"` *(multi-step: lists tasks first, then deletes the completed ones)*
- `"search for tasks about login"`
- `"give me a summary of my tasks"` *(MCP only — via `get_task_summary`)*
- `"what's still pending?"`

---
