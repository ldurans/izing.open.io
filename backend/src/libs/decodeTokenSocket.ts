import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import { logger } from "../utils/logger";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  tenantId: number;
  iat: number;
  exp: number;
}

interface Data {
  id: number | string;
  profile: string;
  tenantId: number | string;
}
interface Result {
  isValid: boolean;
  data: Data;
}

const decode = (token: string): Result => {
  const validation = {
    isValid: false,
    data: {
      id: "",
      profile: "",
      tenantId: 0
    }
  };
  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, tenantId } = decoded as TokenPayload;
    validation.isValid = true;
    validation.data = {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    logger.error(err);
  }
  return validation;
};

export default decode;
