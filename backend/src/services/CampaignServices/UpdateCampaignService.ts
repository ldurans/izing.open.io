import * as Sentry from "@sentry/node";
import { setMinutes, setHours, parseISO } from "date-fns";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import { logger } from "../../utils/logger";

const cArquivoName = (url: string | undefined) => {
  if (!url) return "";
  const split = url.split("/");
  const name = split[split.length - 1];
  return name;
};
interface CampaignData {
  name: string;
  start: string;
  message1: string;
  message2: string;
  message3: string;
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
  let data: any = {
    ...campaignData,
    mediaUrl: cArquivoName(campaignData.mediaUrl),
    start: setHours(setMinutes(parseISO(campaignData.start), 0), 8)
  };

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
