import { Request, Response, NextFunction } from "express";

export const apiAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const expectedToken = process.env.TASK_API_TOKEN;

  const authorization = req.headers.authorization;

  if (!expectedToken) {
    return res.status(500).json({
      success: false,
      message: "Server authentication token is not configured"
    });
  }

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required"
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || token !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization token"
    });
  }

  next();
};