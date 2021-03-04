import { JobOptions } from "bull";
import { setHours, setMinutes, getDate, getMonth } from "date-fns";
import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import CampaignContacts from "../../models/CampaignContacts";
import Queue from "../../libs/Queue";

interface Request {
  campaignId: string | number;
  tenantId: number | string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  options?: JobOptions;
}

const cArquivoName = (url: string | null) => {
  if (!url) return "";
  const split = url.split("/");
  const name = split[split.length - 1];
  return name;
};

const randomInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const mountMessageData = (
  campaign: Campaign,
  campaignContact: CampaignContacts,
  // eslint-disable-next-line @typescript-eslint/ban-types
  options: object | undefined
) => {
  const messageRandom = randomInteger(1, 3);
  let bodyMessage = "";
  if (messageRandom === 1) bodyMessage = campaign.message1;
  if (messageRandom === 2) bodyMessage = campaign.message2;
  if (messageRandom === 3) bodyMessage = campaign.message3;

  return {
    whatsappId: campaign.sessionId,
    message: bodyMessage,
    number: campaignContact.contact.number,
    mediaUrl: campaign.mediaUrl,
    mediaName: cArquivoName(campaign.mediaUrl),
    messageRandom: `message${messageRandom}`,
    campaignContact,
    options
  };
};

const StartCampaignService = async ({
  campaignId,
  tenantId,
  options
}: Request): Promise<void> => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: campaignId, tenantId },
      include: ["session"]
    });

    if (!campaign) {
      throw new AppError("ERROR_CAMPAIGN_NOT_EXISTS", 404);
    }

    const campaignContacts = await CampaignContacts.findAll({
      where: { campaignId },
      include: ["contact"]
    });

    if (!campaignContacts) {
      throw new AppError("ERROR_CAMPAIGN_CONTACTS_NOT_EXISTS", 404);
    }

    const data = campaignContacts.map(
      (campaignContact: CampaignContacts, index) => {
        const date = setHours(setMinutes(campaign.start, 0), 8);
        const cron = `30 8 ${getDate(date)} ${getMonth(date)} 1-5`;
        return mountMessageData(campaign, campaignContact, {
          ...options,
          delay: (options?.delay || 20000) * (index + 1),
          repeat: {
            cron,
            tz: "UTC",
            startDate: setHours(setMinutes(campaign.start, 0), 8),
            endDate: setHours(setMinutes(campaign.start, 0), 18),
            limit: 1
          }
        });
      }
    );

    Queue.add("SendMessageWhatsappCampaign", data);
  } catch (error) {
    throw new Error(`ERROR_CAMPAIGN_NOT_EXISTS ${error}`);
  }
};

export default StartCampaignService;
