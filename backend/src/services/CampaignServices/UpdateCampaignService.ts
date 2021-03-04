import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";

interface CampaignData {
  name: string;
  start: string;
  end: string;
  message1: string;
  message2: string;
  message3: string;
  message4: string;
  mediaUrl?: string;
  mediaType?: string;
  userId: string;
  sessionId: string;
}

interface Request {
  campaignData: CampaignData;
  medias?: Express.Multer.File[];
  campaignId: string | number;
  tenantId: string | number;
}

const UpdateCampaignService = async ({
  campaignData,
  medias,
  campaignId,
  tenantId
}: Request): Promise<Campaign> => {
  let mediaData: Express.Multer.File | undefined;
  let data = campaignData;
  if (medias && Array.isArray(medias) && medias.length) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        try {
          if (!media.filename) {
            const ext = media.mimetype.split("/")[1].split(";")[0];
            media.filename = `${new Date().getTime()}.${ext}`;
          }
          mediaData = media;
        } catch (err) {
          Sentry.captureException(err);
          logger.error(err);
        }
      })
    );
    data = {
      ...campaignData,
      mediaUrl: mediaData?.filename,
      mediaType: mediaData?.mimetype.substr(0, mediaData.mimetype.indexOf("/"))
    };
  } else if (campaignData.mediaUrl === "null") {
    data = {
      ...campaignData,
      mediaUrl: "",
      mediaType: ""
    };
  }

  const campaignModel = await Campaign.findOne({
    where: { id: campaignId, tenantId }
  });

  if (!campaignModel) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaignModel.update(data);

  await campaignModel.reload();

  return campaignModel;
};

export default UpdateCampaignService;
