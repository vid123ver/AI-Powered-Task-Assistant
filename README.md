# AI-Powered Task Assistant

A Task Management app (React + Express + TypeScript) extended with an AI chat assistant that can create, list, update, and delete tasks through natural language, powered by the Google Gemini API's function calling.

This repo builds on the Assignment 1 Task Management app. **Phase 1** adds a `POST /chat` endpoint on the backend that lets Gemini call the existing task APIs as tools. The frontend is **unchanged** from Assignment 1 (no chat UI yet — that's Phase 3).

> Status: **Phase 1 complete** — direct LLM + function-calling integration.
> Not yet built: standalone MCP server (Phase 2), chat UI in the frontend (Phase 3).

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the Chat / Tool-Calling Loop Works](#how-the-chat--tool-calling-loop-works)
- [Tool Definitions](#tool-definitions)
- [Testing in Postman](#testing-in-postman)
- [Example Prompts](#example-prompts)
- [Error Handling](#error-handling)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Architecture

```
                     ┌─────────────────────────┐
                     │        Frontend          │
                     │  React + TS (Assignment 1│
                     │  task UI — unchanged)     │
                     └────────────┬─────────────┘
                                  │ REST (axios)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Backend (Express)                       │
│                                                                    │
│   /tasks  ─────────────►  taskController ──► taskService ──► taskRepository ──► tasks.json
│                                                                    │
│   /chat   ─────────────►  chatController ──► geminiService        │
│                                   │                │               │
│                                   │                ▼               │
│                                   │        Gemini API (function    │
│                                   │        calling loop)           │
│                                   │                │               │
│                                   │   tool call: list_tasks /      │
│                                   │   create_task / update_task /  │
│                                   │   delete_task                  │
│                                   │                │               │
│                                   │                ▼               │
│                                   └────────► taskService (same     │
│                                               functions the REST   │
│                                               API uses)            │
└─────────────────────────────────────────────────────────────────┘
```

**Flow for a chat message:**

1. Frontend (or Postman, for now) sends `{ sessionId, message }` to `POST /chat`.
2. `chatController` passes it to `geminiService.sendMessage()`.
3. `geminiService` keeps one Gemini `Chat` session per `sessionId` in memory (a `Map<string, Chat>`), so conversation history persists across turns without resending it manually.
4. Gemini is called with the task tools declared as `functionDeclarations` plus a `systemInstruction` describing how the assistant should behave.
5. If Gemini decides it needs data or needs to perform an action, it returns one or more `functionCalls` instead of text.
6. The backend executes each function call against `taskService` (the **same service layer** the REST `/tasks` routes use — no duplicated business logic) and sends the result(s) back to Gemini as `functionResponse` parts.
7. This repeats in a loop (capped at 10 iterations) until Gemini has everything it needs and returns a final text answer, which the backend returns to the client as `{ success: true, reply }`.
8. If a tool call throws (e.g. task not found), the error message is sent back to Gemini as the function's response instead of crashing the request — Gemini explains the failure to the user in plain language.

---

## Tech Stack

**Frontend** (unchanged from Assignment 1)
- React + TypeScript, Axios, CSS

**Backend**
- Node.js + Express 5 + TypeScript
- `@google/genai` — official Google Gemini SDK, used for chat sessions and function calling
- JSON file storage (`tasks.json`) via a repository layer — same as Assignment 1
- `dotenv` for config, `cors` for the frontend

---

## Project Structure

```
AI-Powered-Task-Assistant/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── tools.ts              # Gemini function declarations (4 tools)
│   │   │   └── systemInstruction.ts  # System prompt for the assistant
│   │   ├── config/
│   │   │   └── gemini.ts             # Gemini client init (reads GEMINI_API_KEY)
│   │   ├── controllers/
│   │   │   ├── chatController.ts     # POST /chat handler
│   │   │   └── taskController.ts     # Task CRUD handlers (Assignment 1)
│   │   ├── services/
│   │   │   ├── geminiService.ts      # Chat sessions + tool-call loop
│   │   │   └── taskService.ts        # Task business logic (shared by REST + chat)
│   │   ├── repositories/
│   │   │   └── taskRepository.ts     # Reads/writes tasks.json
│   │   ├── routes/
│   │   │   ├── chatRoutes.ts         # POST /chat
│   │   │   └── taskRoutes.ts         # /tasks CRUD
│   │   ├── middlewares/
│   │   │   ├── chatValidation.ts     # Validates chat request body
│   │   │   ├── errorHandler.ts       # Central error handler
│   │   │   └── notFound.ts
│   │   ├── models/
│   │   │   └── Task.ts               # { id, title, completed }
│   │   ├── utils/
│   │   │   ├── AppError.ts
│   │   │   ├── asyncHandler.ts
│   │   │   └── taskValidator.ts
│   │   ├── data/
│   │   │   └── tasks.json
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env.example
│
├── frontend/                          # Unchanged from Assignment 1
│   ├── src/
│   │   ├── api/                       # api.ts (axios instance), taskApi.ts
│   │   ├── hooks/useTasks.ts
│   │   ├── components/                # TaskList, TaskItem, TaskForm, SearchBar, ConfirmDialog
│   │   ├── types/Task.ts
│   │   └── App.tsx
│   └── .env.example
│
└── README.md
```

---

## Setup

### Prerequisites
- Node.js 18+
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 1. Clone

```bash
git clone https://github.com/vid123ver/AI-Powered-Task-Assistant.git
cd AI-Powered-Task-Assistant
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
GEMINI_MODEL=gemini-flash-latest
```

Run it:

```bash
npm run dev
```

Backend runs at `http://localhost:5000` (or whatever `PORT` you set).

### 3. Frontend (unchanged from Assignment 1)

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`. Make sure `VITE_API_BASE_URL` in `frontend/.env` points to your backend (default `http://localhost:5000`).

> The frontend only talks to `/tasks`. There's no chat page yet — use Postman or curl to try `/chat` for now (see [Testing in Postman](#testing-in-postman)).

---

## Environment Variables

**backend/.env**

| Variable | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | API key from Google AI Studio. **Never commit this.** | `AIza...` |
| `PORT` | Port the Express server listens on | `5000` |
| `GEMINI_MODEL` | Gemini model to use for chat | `gemini-flash-latest` |

**frontend/.env**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## API Reference

### Task CRUD (Assignment 1, unchanged)

| Method | Route | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get a single task |
| POST | `/tasks` | Create a task — body: `{ title }` |
| PUT | `/tasks/:id` | Update a task — body: `{ title, completed }` |
| PATCH | `/tasks/:id` | Toggle a task's `completed` status |
| DELETE | `/tasks/:id` | Delete a task |

### Chat (new in Phase 1)

**`POST /chat`**

Request body:

```json
{
  "sessionId": "any-string-you-choose",
  "message": "create a task to fix the login bug"
}
```

Response:

```json
{
  "success": true,
  "reply": "I've created the task \"fix the login bug\" for you."
}
```

- `sessionId` groups messages into one conversation. Reuse the same `sessionId` for follow-up messages (e.g. "now mark it as done") so the assistant remembers earlier context.
- `message` must be a non-empty string — validated by `chatValidation` middleware, which returns a `400` before Gemini is ever called.

---

## How the Chat / Tool-Calling Loop Works

`geminiService.ts` is the core of Phase 1:

1. **Session management** — a `Map<sessionId, Chat>` keeps one Gemini chat object per session in memory. The Gemini SDK's `Chat` object tracks conversation history internally, so we don't have to serialize/replay message history ourselves on every request.
2. **Sending a message** — `chat.sendMessage({ message })` is called with the user's text.
3. **Checking for function calls** — if `response.functionCalls` is non-empty, Gemini wants to act rather than reply directly.
4. **Executing tools** — each function call's `name` is matched against `list_tasks`, `create_task`, `update_task`, or `delete_task`, and the corresponding `taskService` function is called with the arguments Gemini provided.
5. **Returning results to Gemini** — each tool's result (or error) is sent back via `chat.sendMessage({ message: functionResponses })`, using the `functionResponse` format Gemini expects, matched by call `id`.
6. **Looping** — steps 3–5 repeat until Gemini stops requesting function calls and returns text, or a safety cap of 10 iterations is hit (this is what lets multi-step requests like "delete all completed tasks" work: Gemini first calls `list_tasks`, inspects which ones are completed, then calls `delete_task` for each).
7. **Error isolation** — if a tool call throws (e.g. `AppError` for "Task not found"), the error message — not a stack trace — is packaged into the function's response so Gemini can explain it to the user. A malformed request never becomes an unhandled `500` from `/chat`.

---

## Tool Definitions

All four tools are declared in `backend/src/ai/tools.ts` as Gemini `FunctionDeclaration`s:

| Tool | When Gemini calls it | Parameters |
|---|---|---|
| `list_tasks` | User wants to view, list, or check on tasks (pending, completed, or all) | *(none)* |
| `create_task` | User wants to add/create/save a new task | `title` (string, required) |
| `update_task` | User wants to rename a task, or mark it completed/incomplete | `id` (string, required), `title` (string, optional), `completed` (boolean, optional) |
| `delete_task` | User wants to remove/delete a task | `id` (string, required) |

Each description is written to tell the model **when** to use the tool (trigger phrases like "view", "check", "mark as done"), not just what it technically does — this is what makes the model reach for the right tool reliably instead of guessing from its own knowledge.

The `systemInstruction` (in `backend/src/ai/systemInstruction.ts`) additionally tells the assistant to:
- always use a tool rather than answer from memory when one applies,
- ask for clarification instead of guessing missing info,
- never expose task IDs, internal errors, or tool/function names to the user,
- stay scoped to task management only.

---

## Testing in Postman

1. Start the backend (`npm run dev` in `backend/`).
2. `POST http://localhost:5000/chat` with body:
   ```json
   { "sessionId": "demo-1", "message": "create a task called fix the login bug" }
   ```
3. Follow up in the **same session** to test conversation history and multi-step tool calls:
   ```json
   { "sessionId": "demo-1", "message": "list my tasks" }
   ```
   ```json
   { "sessionId": "demo-1", "message": "mark it as done" }
   ```
   ```json
   { "sessionId": "demo-1", "message": "delete all completed tasks" }
   ```
   The last prompt is the multi-step case: Gemini calls `list_tasks` first to see which tasks are completed, then calls `delete_task` for each matching one, then replies with a summary — all within one `/chat` request.

---

## Example Prompts

- "Create a task to review the PR"
- "Show me all my tasks"
- "What tasks do I still have pending?"
- "Mark the login bug task as done"
- "Rename that task to 'Fix login bug on mobile'"
- "Delete the task about reviewing the PR"
- "Delete all completed tasks"

---

## Error Handling

- **Empty/invalid chat message** → caught by `chatValidation` middleware, returns `400` before any Gemini call is made.
- **Tool execution failure** (e.g. task not found) → caught inside the tool-call loop, sent back to Gemini as a `functionResponse.error` so the model can explain it in natural language instead of the request failing.
- **Gemini rate limit (HTTP 429)** → caught and converted into a clear message: *"Gemini API quota exceeded. Please wait a while or use another API key."* instead of a raw error or crash.
- **Unexpected errors** → the global `errorHandler` middleware returns a generic `500` with no stack trace or internal details leaked to the client.

---

## Roadmap

- [x] **Phase 1** — `/chat` endpoint, 4 tools, tool-call loop, session-based history, error handling
- [ ] **Phase 2** — Standalone MCP server (stdio transport) with `zod` schemas, wired into Claude Desktop, plus `get_task_summary` and `search_tasks`
- [ ] **Phase 3** — React chat page, loading states, action cards, rate-limit handling, live task list refetch
