// import AppError from "../../errors/AppError";
import { sign } from "jsonwebtoken";
import ApiConfig from "../../models/ApiConfig";
import authConfig from "../../config/auth";

interface Request {
  name: string;
  sessionId: string | number;
  urlDelivery?: string;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  userId: string | number;
  tenantId: string | number;
}

const CreateApiConfigService = async ({
  name,
  sessionId,
  urlDelivery,
  urlServiceStatus,
  urlMessageStatus,
  userId,
  tenantId
}: Request): Promise<ApiConfig> => {
  const { secret } = authConfig;

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

  const api = await ApiConfig.create({
    name,
    sessionId,
    token,
    urlDelivery,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    tenantId
  });

  return api;
};

export default CreateApiConfigService;
