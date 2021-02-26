import Tenant from "../../models/Tenant";
import AppError from "../../errors/AppError";

interface Request {
  tenantId: string | number;
}

const ShowBusinessHoursAndMessageService = async ({
  tenantId
}: Request): Promise<Tenant> => {
  const tenant = await Tenant.findByPk(tenantId, {
    attributes: ["businessHours", "messageBusinessHours"]
  });

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  return tenant;
};

export default ShowBusinessHoursAndMessageService;
