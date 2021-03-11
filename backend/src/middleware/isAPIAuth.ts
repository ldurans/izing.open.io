import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface TokenPayload {
  apiId: string;
  sessionId: number;
  tenantId: number;
  iat: number;
  exp: number;
}

const isAPIAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token was not provided.", 403);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { apiId, sessionId, tenantId } = decoded as TokenPayload;

    req.APIAuth = {
      apiId,
      sessionId,
      tenantId
    };
  } catch (err) {
    throw new AppError("Invalid token.", 403);
  }

  return next();
};

export default isAPIAuth;
