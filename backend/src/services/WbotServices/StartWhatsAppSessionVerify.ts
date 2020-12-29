import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";

export const StartWhatsAppSessionVerify = async (
  whatsappId: number,
  error: string
): Promise<void> => {
  const errorString = error.toString().toLowerCase();
  const sessionClosed = "session closed";
  const WAPP_NOT_INIT = "ERR_WAPP_NOT_INITIALIZED".toLowerCase();
  if (
    errorString.indexOf(sessionClosed) !== -1 ||
    errorString.indexOf(WAPP_NOT_INIT) !== -1
  ) {
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    try {
      if (whatsapp) {
        await whatsapp.update({ status: "OPENING" });
        const io = getIO();
        io.emit(`${whatsapp?.tenantId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });
        const wbot = await initWbot(whatsapp);
        wbotMessageListener(wbot);
        wbotMonitor(wbot, whatsapp);
      }
    } catch (err) {
      console.log("StartWhatsAppSessionVerify", err);
    }
  }
};
