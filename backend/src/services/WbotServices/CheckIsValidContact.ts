import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
// import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

const CheckIsValidContact = async (
  number: string,
  tenantId: string | number
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    // const isValidNumber = await wbot.isRegisteredUser(`${number}@c.us`);
    const idNumber = await wbot.getNumberId(number);
    if (!idNumber) {
      throw new AppError("invalidNumber", 400);
    }
    return idNumber;
  } catch (err: any) {
    logger.error(`CheckIsValidContact | Error: ${err}`);
    // StartWhatsAppSessionVerify(defaultWhatsapp.id, err);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
