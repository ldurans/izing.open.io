// import AppError from "../../errors/AppError";
import { sign } from "jsonwebtoken";
import ApiInstance from "../../models/ApiConfig";
import authConfig from "../../config/auth";
import AppError from "../../errors/AppError";

interface Request {
  apiId: string;
  sessionId: string | number;
  userId: string | number;
  tenantId: string | number;
}

const RenewApiConfigTokenService = async ({
  apiId,
  sessionId,
  tenantId
}: Request): Promise<ApiInstance> => {
  const { secret } = authConfig;

  const api = await ApiInstance.findByPk(apiId);

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  const token = sign(
    {
      tenantId,
      profile: "admin",
      sessionId
    },
    secret,
    {
      expiresIn: "730d"
    }
  );

  api.update({ token });
  api.reload();

  return api;
};

export default RenewApiConfigTokenService;
