import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetDefaultWhatsApp = async (
  tenantId: string | number,
  channelId?: number
): Promise<Whatsapp> => {
  const where: any = { tenantId, status: "CONNECTED" };

  if (channelId) {
    where.id = channelId;
  } else {
    where.type = "whatsapp";
  }

  const defaultWhatsapp = await Whatsapp.findOne({
    where
  });

  if (!defaultWhatsapp || !tenantId) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND");
  }

  return defaultWhatsapp;
};

export default GetDefaultWhatsApp;
