import { JobOptions } from "bull";
import { pupa } from "../../utils/pupa";
import {
  setHours,
  setMinutes,
  addSeconds,
  isWithinInterval,
  parse,
  getDay,
  addDays,
  differenceInSeconds,
  startOfDay,
  isAfter,
  isBefore,
  differenceInDays
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
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
  options: object | undefined,
//  ticket: { protocol: string, contact: { name: string } } // Adicione o parâmetro do ticket aqui
) => {
  const messageRandom = randomInteger(1, 3);
  let bodyMessage = "";
  if (messageRandom === 1) bodyMessage = campaign.message1;
  if (messageRandom === 2) bodyMessage = campaign.message2;
  if (messageRandom === 3) bodyMessage = campaign.message3;

  // Use a função pupa para substituir partes da mensagem
  bodyMessage = pupa(bodyMessage || "", {
    // greeting: será considerado conforme data/hora da mensagem internamente na função pupa
//    protocol: ticket.protocol,
    name: campaignContact.contact.name
  });
  
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

const nextDayHoursValid = (date: Date) => {
  let dateVerify = date;
  const dateNow = new Date();
  const diffDays = differenceInDays(dateVerify, new Date());
  if (diffDays < 0) {
    dateVerify = addDays(dateVerify, diffDays * -1);
  }

  if (dateVerify.getTime() < dateNow.getTime()) {
    dateVerify = setMinutes(
      setHours(dateVerify, dateNow.getHours()),
      dateNow.getMinutes()
    );
  }

  const start = parse("08:00", "HH:mm", dateVerify);
  const end = parse("20:00", "HH:mm", dateVerify);

  const isValidHour = isWithinInterval(dateVerify, { start, end });

  const isDateBefore = isBefore(start, dateVerify);
  const isDateAfter = isAfter(end, dateVerify);

  if (!isValidHour && isDateBefore) {
    dateVerify = setMinutes(setHours(dateVerify, 8), 30);
  }

  if (!isValidHour && isDateAfter && diffDays === 0) {
    dateVerify = addDays(setHours(dateVerify, 8), 1);
  }

  if (!isValidHour && isDateAfter && diffDays > 0) {
    dateVerify = setHours(dateVerify, 8);
  }

  return dateVerify;
};

const calcDelay = (nextDate: Date, delay: number) => {
  const diffSeconds = differenceInSeconds(nextDate, new Date());

  return diffSeconds * 1000 + delay;
};

const StartCampaignService = async ({
  campaignId,
  tenantId,
  options
}: Request): Promise<void> => {
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
    throw new AppError("ERR_CAMPAIGN_CONTACTS_NOT_EXISTS", 404);
  }

  const timeDelay = campaign.delay ? campaign.delay * 1000 : 20000;

  let dateDelay = zonedTimeToUtc(campaign.start, "America/Sao_Paulo");
  const data = campaignContacts.map((campaignContact: CampaignContacts) => {
    dateDelay = addSeconds(dateDelay, timeDelay / 1000);
    return mountMessageData(campaign, campaignContact, {
      ...options,
      jobId: `campaginId_${campaign.id}_contact_${campaignContact.contactId}_id_${campaignContact.id}`,
      delay: calcDelay(dateDelay, timeDelay)
    });
  });

  Queue.add("SendMessageWhatsappCampaign", data);

  await campaign.update({
    status: "scheduled"
  });
};

export default StartCampaignService;
