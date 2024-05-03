import BullQueues from "bull";
import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import CampaignContacts from "../../models/CampaignContacts";

interface Request {
  campaignId: string | number;
  tenantId: number | string;
}

const CancelCampaignService = async ({
  campaignId,
  tenantId
}: Request): Promise<void> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, tenantId }
  });

  if (!campaign) {
    throw new AppError("ERROR_CAMPAIGN_NOT_EXISTS", 404);
  }
  // jobId: `campaginId_${campaign.id}_contact_${campaignContact.contactId}_id_${campaignContact.id}`,
  try {
    await BullQueues("SendMessageWhatsappCampaign", {
      redis: {
        port: Number(process.env.IO_REDIS_PORT),
        host: process.env.IO_REDIS_SERVER,
        db: Number(process.env.IO_REDIS_DB_SESSION) || 2,
        password: process.env.IO_REDIS_PASSWORD || undefined
      }
    }).removeJobs(`campaginId_${campaign.id}*`);

    await CampaignContacts.update(
      {
        body: null,
        mediaName: null,
        timestamp: null,
        ack: 0,
        messageId: null
      },
      {
        where: {
          campaignId: campaign.id,
          messageId: null
        }
      }
    );

    await campaign.update({
      status: "canceled"
    });
  } catch (error) {
    throw new AppError(`ERROR: ${error}`, 404);
  }
};

export default CancelCampaignService;
