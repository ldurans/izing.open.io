import Tenant from "../../models/Tenant";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  tenantId?: string | number;
}

const AdminListChannelsService = async ({
  tenantId
}: Request): Promise<Whatsapp[]> => {
  const whereCondition: any = {};
  if (tenantId) {
    whereCondition.tenantId = tenantId;
  }

  const whatsapps = await Whatsapp.findAll({
    where: whereCondition,
    include: [{ model: Tenant, as: "tenant", attributes: ["id", "name"] }]
  });

  return whatsapps;
};

export default AdminListChannelsService;
