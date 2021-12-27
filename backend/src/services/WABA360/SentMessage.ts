import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  message: WabaMessage;
  apiKey: string;
}

// Use this endpoint sent message waba.
const SentMessage = async ({
  message,
  apiKey
}: Request): Promise<WabaResponse> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/messages`;

  try {
    const res = await axios({
      method: "post",
      url: apiUrl360,
      data: { ...message },
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_SENT_MESSAGE: ${error}`);
  }
};

export default SentMessage;
