import { Router } from "express";
import { chat } from "../controllers/chatController";
import { validateChatRequest } from "../middlewares/chatValidation";

const router = Router();

router.post("/", validateChatRequest, chat);

export default router;