# AI-Powered Task Assistant

A Task Management app (React + Express + TypeScript, extended from Assignment 1) with an AI assistant layered on top, built two ways:

1. **`POST /chat`** — a backend endpoint where Google Gemini manages tasks via function calling, used by the in-app chat page.
2. **A standalone MCP server** — the same task tools exposed over the Model Context Protocol, usable from any MCP client (tested with Claude Desktop).

> **Status: Phases 1, 2, and 3 complete.** The frontend has a full AI Assistant chat page (in the nav) alongside the original task list. Both the in-app chat and Claude Desktop (via the MCP server) can manage tasks end-to-end.

---

## Table of Contents

- [Architecture](#architecture)
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

## Architecture

```
Frontend (React)                 Backend (Express)                 Gemini API
┌─────────────────┐              ┌───────────────────────┐         (function calling)
│ Tasks tab        │── REST ────►│ /tasks → taskController│
│ (list/add/edit)  │              │                        │
│                  │              │ /chat  → chatController│
│ AI Assistant tab │── REST ────►│         → geminiService ├───────► tool calls
│ (chat UI)        │              │         → taskService  │              │
└─────────────────┘              └───────────┬────────────┘              ▼
                                              │                    taskService (same
                                              ▼                    layer /tasks uses)
                                        tasks.json (file store)

MCP Server (stdio transport)      Claude Desktop
┌────────────────────────┐        ┌──────────────────┐
│ task-management-server │◄───────│ connects as an     │
│ 6 registered tools      │        │ MCP client         │
└───────────┬─────────────┘        └──────────────────┘
            │ HTTP + Bearer token
            ▼
     Backend /tasks REST API
```

The `/chat` endpoint and the MCP server are two separate, parallel ways to let an AI use the same task tools:

- **`/chat`** talks to Gemini directly and calls `taskService` in-process (no HTTP hop).
- **The MCP server** talks to any MCP client and calls the backend's `/tasks` REST API over HTTP with a bearer token — this is how it stays decoupled from the AI provider entirely.

---

## Project Structure

```
AI-Powered-Task-Assistant/
├── backend/                 # Express + TS API — /tasks (CRUD) and /chat (Gemini)
│   └── src/
│       ├── ai/               # Gemini tool declarations + system instruction
│       ├── controllers/
│       ├── services/         # taskService, geminiService
│       ├── repositories/     # tasks.json file store
│       ├── middlewares/      # apiAuth, chatValidation, errorHandler
│       └── routes/
├── frontend/                 # React + TS — task list UI + AI Assistant chat page
│   └── src/
│       ├── components/Chat/  # ChatPage, ActionCard
│       ├── api/               # taskApi, chatApi
│       └── hooks/useTasks.ts
├── mcp-server/                # Standalone MCP server (stdio transport)
│   └── src/
│       ├── tools/             # 6 registered MCP tools (zod schemas)
│       └── services/taskApi.ts # calls backend /tasks over HTTP
├── WRITEUP.md                 # what I learned / what confused me / what I'd change
└── Assignment3_Phase-1.postman_collection.json
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

Runs on `http://localhost:5000` by default (set by `PORT` in `.env.example`).

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
cp .env.example .env   # TASK_API_TOKEN — must match the backend's token
npm run build
```

---

## Environment Variables

**backend/.env**
```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
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
TASK_API_TOKEN=some-shared-secret   # must match the backend's TASK_API_TOKEN
```

`TASK_API_TOKEN` is required by the backend's `/tasks` routes (bearer auth) — both the frontend and the MCP server authenticate with it. Without it set on the backend, every `/tasks` request returns `500 Server authentication token is not configured`. No `.env` file is committed — only `.env.example` templates are.

---

## Backend REST API

All `/tasks` routes require `Authorization: Bearer <TASK_API_TOKEN>`.

| Method | Route         | Description              |
|--------|---------------|---------------------------|
| GET    | `/tasks`      | List all tasks            |
| GET    | `/tasks/:id`  | Get one task               |
| POST   | `/tasks`      | Create a task (`title`, optional `priority`) |
| PUT    | `/tasks/:id`  | Update a task              |
| PATCH  | `/tasks/:id`  | Toggle completion          |
| DELETE | `/tasks/:id`  | Delete a task               |

## POST /chat

```json
// request
{ "sessionId": "abc-123", "message": "create a high priority task to fix the login bug" }

// response
{
  "success": true,
  "reply": "I've created the task \"fix the login bug\" with high priority.",
  "actions": [
    { "type": "create_task", "task": { "id": "…", "title": "fix the login bug" } }
  ]
}
```

`sessionId` keeps a Gemini `Chat` session (with history) alive in memory per session, so follow-ups like "now mark it as done" work without resending prior turns. Sessions are in-memory only and reset on server restart.

---

## MCP Server

Runs over **stdio transport**, built with `@modelcontextprotocol/sdk` and `zod` for input schemas. It doesn't talk to Gemini — it calls the backend's `/tasks` REST API with the bearer token from `TASK_API_TOKEN`.

### Connecting the MCP Server to Claude Desktop

Add to your Claude Desktop MCP config (see modelcontextprotocol.io for the exact file location for your OS):

```json
{
  "mcpServers": {
    "task-management-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/server.js"],
      "env": {
        "TASK_API_TOKEN": "some-shared-secret"
      }
    }
  }
}
```

Make sure the backend is running first (and its port matches what `taskApi.ts` expects — see the port note above), then restart Claude Desktop.

---

## Tools Exposed

**Via `/chat` (Gemini function calling, 4 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task`

**Via MCP server (6 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task`, `get_task_summary`, `search_tasks`

Each tool returns structured data (e.g. `create_task` returns the created task's `id`, `title`, `completed`, `priority` — not just a success flag).

---

## Example Prompts

Tried against both the `/chat` UI and Claude Desktop (via MCP):

- `"create a high priority task to fix the login bug"`
- `"show me all my tasks"`
- `"mark the login bug task as done"`
- `"delete all completed tasks"` *(multi-step: lists tasks first, then deletes the completed ones)*
- `"search for tasks about login"`
- `"give me a summary of my tasks"` *(MCP only — via `get_task_summary`)*
- `"what's still pending?"`

---