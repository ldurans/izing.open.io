import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface Request {
  messageBusinessHours: string;
  tenantId: number | string;
}

const UpdateMessageBusinessHoursService = async ({
  messageBusinessHours,
  tenantId
}: Request): Promise<Tenant> => {
  const tenantModel = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenantModel) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  await tenantModel.update({
    messageBusinessHours
  });

  await tenantModel.reload({
    attributes: ["businessHours", "messageBusinessHours"]
  });

  return tenantModel;
};

export default UpdateMessageBusinessHoursService;
