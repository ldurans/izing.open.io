import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Response {
  // eslint-disable-next-line camelcase
  phone_number: string;
}

// Use this edge to manage your profile's About section.
const GetRegisteredPhone = async (apiKey: string): Promise<Response> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/configs/phone_number`;

  try {
    const res = await axios({
      method: "get",
      url: apiUrl360,
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_GET_PHONE_NUMBER_REGISTERED: ${error}`);
  }
};

export default GetRegisteredPhone;
