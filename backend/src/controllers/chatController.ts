import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import geminiService from "../services/geminiService";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;

  const reply = await geminiService.sendMessage(message);

  res.status(200).json({
    success: true,
    reply,
  });
});