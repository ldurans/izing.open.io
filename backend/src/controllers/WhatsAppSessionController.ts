import { Request, Response } from "express";
// import path from "path";
// import { rmdir } from "fs/promises";
import { getWbot, removeWbot, apagarPastaSessao } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { setValue } from "../libs/redisClient";
import { logger } from "../utils/logger";
import { getTbot, removeTbot } from "../libs/tbot";
import { getInstaBot, removeInstaBot } from "../libs/InstaBot";
import AppError from "../errors/AppError";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  });

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

  await apagarPastaSessao(whatsappId);
  StartWhatsAppSession(whatsapp);
  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId });

  try {
    if (channel.type === "whatsapp") {
      const wbot = getWbot(channel.id);
      await setValue(`${channel.id}-retryQrCode`, 0);
      await wbot.logout();
      await wbot.destroy();
      await removeWbot(channel.id);
      await apagarPastaSessao(whatsappId);
    }
    if (channel.type === "telegram") {
      const tbot = getTbot(channel.id);
      await tbot.telegram.logOut();
      await removeTbot(channel.id);
    }
    if (channel.type === "instagram") {
      const instaBot = getInstaBot(channel.id);
      await instaBot.destroy();
      await removeInstaBot(channel);
    }

    await channel.update({
      status: channel.type === "whatsapp" ? "DESTROYED" : "DISCONNECTED",
      session: "",
      retries: 0
    });
  } catch (error) {
    logger.error(error);
    await channel.update({
      status: channel.type === "whatsapp" ? "DESTROYED" : "DISCONNECTED",
      session: "",
      retries: 0
    });
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }
  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
