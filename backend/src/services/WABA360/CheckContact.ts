import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Contact {
  input: string;
  // eslint-disable-next-line camelcase
  wa_id: string;
  status: "valid" | "invalid" | "failed" | "processing";
}

interface Request {
  contacts: string[];
  apiKey: string;
}

// Use this endpoint to manage your profile photo.
const CheckContact = async ({
  contacts,
  apiKey
}: Request): Promise<Contact[]> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/contacts`;

  try {
    const res = await axios({
      method: "post",
      url: apiUrl360,
      data: {
        blocking: "wait",
        force_check: true,
        contacts
      },
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_GET_CONTACTS: ${error}`);
  }
};

export default CheckContact;
