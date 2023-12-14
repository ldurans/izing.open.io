import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
  isActive?: boolean;
  type?: "waba" | "instagram" | "telegram" | "whatsapp" | "messenger";
  wabaBSP?: string;
  tokenAPI?: string;
  fbPageId?: string;
  farewellMessage?: string;
  chatFlowId?: number;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  tenantId: string | number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  tenantId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    isDefault: Yup.boolean()
  });

  const {
    name,
    status,
    isDefault,
    session,
    tokenTelegram,
    instagramUser,
    instagramKey,
    isActive,
    type,
    wabaBSP,
    tokenAPI,
    fbPageId,
    farewellMessage,
    chatFlowId
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });

    let oldDefaultWhatsapp: Whatsapp | null = null;

    if (isDefault) {
      oldDefaultWhatsapp = await Whatsapp.findOne({
        where: { isDefault: true, tenantId, id: { [Op.not]: whatsappId } }
      });
      if (oldDefaultWhatsapp) {
        await oldDefaultWhatsapp.update({ isDefault: false });
      }
    }

    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, tenantId }
    });

    if (!whatsapp) {
      throw new AppError("ERR_NO_WAPP_FOUND", 404);
    }

    const data: WhatsappData = {
      name,
      status,
      session,
      isDefault,
      tokenTelegram,
      instagramUser,
      isActive,
      type,
      wabaBSP,
      tokenAPI,
      fbPageId,
      farewellMessage,
      chatFlowId
    };

    if (instagramKey) {
      data.instagramKey = instagramKey;
    }

    await whatsapp.update(data);

    return { whatsapp, oldDefaultWhatsapp };
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default UpdateWhatsAppService;
