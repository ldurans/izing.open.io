import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  text: string;
  apiKey: string;
}

// Use this edge to manage your profile's About section.
const SetAboutProfileInfo = async ({
  text,
  apiKey
}: Request): Promise<boolean> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/settings/profile/about`;

  try {
    await axios({
      method: "patch",
      url: apiUrl360,
      data: { text },
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_SET_ABOUT: ${error}`);
  }
};

export default SetAboutProfileInfo;
