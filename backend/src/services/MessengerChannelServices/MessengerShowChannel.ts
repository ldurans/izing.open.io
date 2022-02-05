import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Data {
  fbPageId: string | number;
}

const MessengerShowChannel = async ({ fbPageId }: Data): Promise<Whatsapp> => {
  const attr = [
    "id",
    "name",
    "status",
    "type",
    "createdAt",
    "updatedAt",
    "tenantId",
    "tokenAPI",
    "fbPageId",
    "fbObject",
    "instagramKey"
  ];

  const channel = await Whatsapp.findOne({
    where: {
      fbPageId
    },
    attributes: attr
  });

  if (!channel) {
    throw new AppError("ERR_NO_CHANNEL_FOUND", 404);
  }

  return channel;
};

export default MessengerShowChannel;
