import axios from "axios";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface BusinessProfile {
  vertical:
  | "Automotive"
  | "Beauty, Spa and Salon"
  | "Clothing and Apparel"
  | "Education"
  | "Entertainment"
  | "Event Planning and Service"
  | "Finance and Banking"
  | "Food and Grocery"
  | "Public Service"
  | "Hotel and Lodging"
  | "Medical and Health"
  | "Non-profit"
  | "Professional Services"
  | "Shopping and Retail"
  | "Travel and Transportation"
  | "Restaurant"
  | "Other";
  websites: string[];
  email: string;
  description: string;
  address: string;
}

interface Request {
  data: BusinessProfile;
  apiKey: string;
}

// Use this edge to manage your profile's About section.
const SetBusinessProfile = async ({
  data,
  apiKey
}: Request): Promise<boolean> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/settings/business/profile`;

  try {
    await axios({
      method: "post",
      url: apiUrl360,
      data,
      headers: {
        "D360-API-KEY": apiKey,
        "Content-Type": "application/json"
      }
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_SET_BUSINESS: ${error}`);
  }
};

export default SetBusinessProfile;
