# AI-Powered Task Assistant

A Task Management app (React + Express + TypeScript, from Assignment 1) extended with:
1. A `POST /chat` endpoint where Google Gemini manages tasks via function calling.
2. A standalone MCP server exposing the same task tools over the Model Context Protocol, usable from Claude Desktop.

> **Status: Phase 1 and Phase 2 complete.** Phase 3 (chat UI in the frontend) is **not built yet** — the frontend is still the plain Assignment 1 task list (add / edit / complete / delete / search), with no AI chat page. Right now the AI assistant is only reachable via Postman (`POST /chat`) or via Claude Desktop through the MCP server.

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

---

## Architecture

```
Frontend (React)                Backend (Express)                  Gemini API
plain task list  ── REST ──►    /tasks  → taskController            (function calling)
(no chat UI yet)                /chat   → chatController
                                          → geminiService ────────►  tool calls
                                          → taskService                 │
                                                                        ▼
                                                                  taskService (same
                                                                  layer /tasks uses)

MCP Server (stdio)              Claude Desktop
task-management-server   ◄────  connects as MCP client
  6 tools ── HTTP + Bearer ──►  Backend /tasks REST API
```

The `/chat` endpoint and the MCP server are two separate, parallel ways to let an AI use the same task tools:
- `/chat` talks to Gemini directly and calls `taskService` in-process.
- The MCP server talks to any MCP client (tested with Claude Desktop) and calls the backend `/tasks` REST API over HTTP with a bearer token.

---

## Project Structure

```
AI-Powered-Task-Assistant/
├── backend/            # Express + TS API — /tasks (CRUD) and /chat (Gemini)
│   └── src/
│       ├── ai/         # Gemini tool declarations + system instruction
│       ├── controllers/
│       ├── services/   # taskService, geminiService
│       ├── repositories/  # tasks.json file store
│       └── routes/
├── frontend/           # React + TS — Assignment 1 task UI (no chat page yet)
├── mcp-server/         # Standalone MCP server (stdio transport)
│   └── src/
│       ├── tools/      # 6 registered MCP tools (zod schemas)
│       └── services/   # calls backend /tasks over HTTP
└── Assignment3_Phase-1.postman_collection.json
```

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in GEMINI_API_KEY and TASK_API_TOKEN
npm run dev
```

Runs on `http://localhost:5001` by default.

### 2. Frontend

```bash
cd frontend
npm install
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

**mcp-server/.env**
```
TASK_API_TOKEN=some-shared-secret   # must match backend's TASK_API_TOKEN
```

`TASK_API_TOKEN` is required by the backend's `/tasks` routes (bearer auth) and is how the MCP server authenticates to the backend. Neither `.env` file is committed — only `.env.example` templates are.

---

## Backend REST API

All `/tasks` routes require `Authorization: Bearer <TASK_API_TOKEN>`.

| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task (`title`, optional `priority`) |
| PUT | `/tasks/:id` | Update a task |
| PATCH | `/tasks/:id` | Toggle completion |
| DELETE | `/tasks/:id` | Delete a task |

## POST /chat

```json
// request
{ "sessionId": "abc-123", "message": "create a high priority task to fix the login bug" }

// response
{ "success": true, "reply": "I've created the task \"fix the login bug\" with high priority." }
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

Make sure the backend is running first, then restart Claude Desktop.

---

## Tools Exposed

**Via `/chat` (Gemini function calling, 4 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task`

**Via MCP server (6 tools):** `list_tasks`, `create_task`, `update_task`, `delete_task`, `get_task_summary`, `search_tasks`

Each tool returns structured data (e.g. `create_task` returns the created task's `id`, `title`, `completed`, `priority` — not just a success flag).

---

