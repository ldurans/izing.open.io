import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  file: any;
  apiKey: string;
}

// Use this endpoint to manage your profile photo.
const SetPhotoProfileInfo = async ({
  file,
  apiKey
}: Request): Promise<boolean> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/settings/profile/photo`;

  try {
    await axios({
      method: "post",
      url: apiUrl360,
      data: { file },
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "multipart/form-data"
      }
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_SET_PHOTO: ${error}`);
  }
};

export default SetPhotoProfileInfo;
