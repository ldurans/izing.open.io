import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface Day {
  day: string | number;
  label: string;
  type: string;
  hr1: string;
  hr2: string;
  hr3: string;
  hr4: string;
}

interface Request {
  businessHours: Day[];
  tenantId: number | string;
}

const UpdateBusinessHoursService = async ({
  businessHours,
  tenantId
}: Request): Promise<Tenant> => {
  const tenantModel = await Tenant.findOne({
    where: { id: tenantId }
  });

  if (!tenantModel) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  await tenantModel.update({
    businessHours
  });

  await tenantModel.reload({
    attributes: ["businessHours", "messageBusinessHours"]
  });

  return tenantModel;
};

export default UpdateBusinessHoursService;
