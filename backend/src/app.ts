import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import chatRoutes from "./routes/chatRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;