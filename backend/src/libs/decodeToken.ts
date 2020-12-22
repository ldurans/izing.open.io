import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  tenantId: number;
  iat: number;
  exp: number;
}

const decode = (jwt: string) => {
  if (!jwt) {
    throw new AppError("Token was not provided.", 403);
  }
  const [, token] = jwt.split(" ");
  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, tenantId } = decoded as TokenPayload;

    return {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    throw new AppError("Invalid token.", 403);
  }
};

export default decode;
