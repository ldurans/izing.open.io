import { Request, Response } from "express";
import path from "path";
import { rmdir } from "fs/promises";
import { getWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { setValue } from "../libs/redisClient";
import { logger } from "../utils/logger";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService(whatsappId, tenantId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" },
    tenantId
  });

  const pathRoot = path.resolve(__dirname, "..", "..", "WWebJS");
  const pathSession = `${pathRoot}/session-${whatsapp.name}`;
  console.log("pathSession StartWhatsAppSession", pathSession);
  await rmdir(pathSession, { recursive: true });
  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService(whatsappId, tenantId);

  try {
    const wbot = getWbot(whatsapp.id);
    await whatsapp.update({ status: "DESTROYED", session: "", retries: 0 });
    await setValue(`${whatsapp.id}-retryQrCode`, 0);
    await wbot.logout();
    await wbot.destroy();
  } catch (error) {
    logger.error(error);
  }
  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
