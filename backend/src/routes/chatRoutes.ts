import { Router } from "express";
import { chat } from "../controllers/chatController";
import { validateChatRequest } from "../middlewares/chatValidation";
import { apiAuth } from "../middlewares/apiAuth";

const router = Router();

router.post("/", apiAuth, validateChatRequest, chat);
export default router;