import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface MessageText {
  text: {
    body: string;
  };
}

interface MessageMedia {
  id: string;
  caption: string;
}

interface MessageWABA {
  // eslint-disable-next-line camelcase
  recipient_type: "individual" | "group";
  to: string;
  type: "text" | "template" | "image" | "video" | "audio" | "document";
  text?: MessageText;
  video?: MessageMedia;
  image?: MessageMedia;
  document?: MessageMedia;
  audio?: MessageMedia;
}

interface Request {
  message: MessageWABA;
  apiKey: string;
}

interface messageId {
  id: string;
}

interface Response {
  messages: messageId[];
}

// Use this endpoint sent message waba.
const SentMessage = async ({ message, apiKey }: Request): Promise<Response> => {
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
