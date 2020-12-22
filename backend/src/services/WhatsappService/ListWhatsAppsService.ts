import Whatsapp from "../../models/Whatsapp";

const ListWhatsAppsService = async (
  tenantId: string | number
): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({ where: { tenantId } });

  return whatsapps;
};

export default ListWhatsAppsService;
