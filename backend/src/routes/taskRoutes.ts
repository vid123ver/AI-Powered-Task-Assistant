import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
} from "../controllers/taskController";
import { apiAuth } from "../middlewares/apiAuth";
const router = Router();

router.use(apiAuth);

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

router.patch("/:id", toggleTask); 
export default router;