import AppError from "../../errors/AppError";
import ApiConfig from "../../models/ApiConfig";

interface Request {
  apiId: string | number;
  tenantId: string | number;
}

const DeleteApiConfigService = async ({
  apiId,
  tenantId
}: Request): Promise<void> => {
  const api = await ApiConfig.findOne({
    where: { id: apiId, tenantId }
  });

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  await api.destroy();
};

export default DeleteApiConfigService;
