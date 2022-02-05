import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  whatsapp: Whatsapp;
  tenantId: number | string;
}

const SetLogoutLinkedPage = async ({
  whatsapp,
  tenantId
}: Request): Promise<void> => {
  const io = getIO();

  const dataUpdated = {
    fbPageId: null,
    fbObject: {},
    tokenAPI: null,
    status: "DISCONNECTED"
  };

  Whatsapp.update(dataUpdated, { where: { id: whatsapp.id, tenantId } });

  io.emit(`${tenantId}:whatsappSession`, {
    action: "update",
    session: { ...whatsapp, ...dataUpdated }
  });
};

export default SetLogoutLinkedPage;
