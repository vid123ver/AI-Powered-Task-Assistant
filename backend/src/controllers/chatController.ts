import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import geminiService from "../services/geminiService";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;

  const result = await geminiService.sendMessage(
    sessionId,
    message
  );

  res.status(200).json({
    success: true,
    reply: result.reply,
    actions: result.actions,
  });
});