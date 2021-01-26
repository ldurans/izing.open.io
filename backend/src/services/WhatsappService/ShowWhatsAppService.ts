import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowWhatsAppService = async (
  id: string | number,
  tenantId: string | number = ""
): Promise<Whatsapp> => {
  const whatsapp = await Whatsapp.findByPk(id);

  if (!whatsapp || (tenantId && whatsapp.tenantId !== tenantId)) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
