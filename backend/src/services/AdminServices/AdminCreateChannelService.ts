import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  name: string;
  status?: string;
  isDefault?: boolean;
  tenantId: string | number;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const AdminCreateChannelService = async ({
  name,
  status = "OPENING",
  isDefault = false,
  tenantId,
  tokenTelegram,
  instagramUser,
  instagramKey
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (value) {
            const whatsappFound = await Whatsapp.findOne({
              where: { name: value }
            });
            return !whatsappFound;
          }
          return true;
        }
      ),
    isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne({ where: { tenantId } });

  if (!whatsappFound) {
    isDefault = !whatsappFound;
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, tenantId }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  const whatsapp = await Whatsapp.create({
    name,
    status,
    isDefault,
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey
  });

  return { whatsapp, oldDefaultWhatsapp };
};

export default AdminCreateChannelService;
