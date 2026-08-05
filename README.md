# Task Management Application

A simple full-stack Task Management application built using React, TypeScript, Express, and Node.js. This project was developed as part of an onboarding assignment to demonstrate CRUD operations, API integration, and clean project architecture.

## Features

- Add a new task (with validation on title length and type)
- View all tasks
- Search tasks by title
- Mark task as Completed/Pending
- Edit task title inline
- Delete a task with confirmation dialog
- Loading, error, and empty states on the task list
- Responsive layout (mobile, tablet, desktop)
- Centralized error handling on the backend
- Environment-based configuration via `.env`
- JSON file-based data storage (persists across restarts)

## Tech Stack

### Frontend
- React
- TypeScript
- Axios
- CSS

### Backend
- Node.js
- Express
- TypeScript
- dotenv

## Project Structure

```
task-management-application
│
├── backend
│   ├── src
│   │   ├── controllers      # handles req/res, no business logic
│   │   ├── services         # business logic
│   │   ├── repositories     # reads/writes tasks.json
│   │   ├── middlewares      # error handler, 404 handler
│   │   ├── utils            # AppError, asyncHandler, validators
│   │   ├── routes
│   │   ├── models
│   │   ├── data
│   │   │   └── tasks.json
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env.example
│
├── frontend
│   ├── src
│   │   ├── api               # api.ts (axios instance), taskApi.ts (endpoints)
│   │   ├── hooks              # useTasks.ts — state + task actions
│   │   ├── components
│   │   ├── types
│   │   ├── App.tsx
│   │   └── index.css
│   └── .env.example
│
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/vid123ver/task-management-application.git
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on the port set in `.env` (default: `http://localhost:5000`)

### Frontend

Open another terminal.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get task by ID |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| PATCH | /tasks/:id | Toggle task status |
| DELETE | /tasks/:id | Delete a task |

## Screenshots

<h3>Home Page</h3>
<img src="./screenshots/first.png" width="800">

<h3>Create Task</h3>
<img src="./screenshots/task_added.png" width="800">

<h3>Search Task</h3>
<img src="./screenshots/search.png" width="800">

<h3>Edit Task</h3>
<img src="./screenshots/edit_task.png" width="800">

<h3>Delete Confirmation</h3>
<img src="./screenshots/delete.png" width="800">

<h3>Mobile View</h3>
<img src="./screenshots/mobile_view.png" height="700">

## Future Improvements

- Move from JSON file storage to a real database (MongoDB/PostgreSQL)
- Add user authentication so tasks are scoped per user
- Add due dates and priority levels for tasks
- Add unit/integration tests (backend services, frontend components)
- Add pagination or infinite scroll for large task lists
- Replace manual validation with a schema library (e.g. Zod) if the app grows

---
** Developed by Vidhan Verma **
GitHub: https://github.com/vid123ver