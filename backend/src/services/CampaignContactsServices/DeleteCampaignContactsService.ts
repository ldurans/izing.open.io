import CampaignContacts from "../../models/CampaignContacts";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";

interface Request {
  campaignId: string | number;
  contactId: string | number;
  tenantId: number | string;
}

const DeleteCampaignContactsService = async ({
  campaignId,
  contactId,
  tenantId
}: Request): Promise<void> => {
  const cc = await CampaignContacts.findOne({
    where: { campaignId, contactId },
    include: [
      {
        model: Campaign,
        required: true,
        where: {
          id: campaignId,
          tenantId
        }
      }
    ]
  });

  if (!cc) {
    throw new AppError("ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND", 404);
  }
  try {
    await cc.destroy();
  } catch (error) {
    throw new AppError("ERR_CAMPAIGN_CONTACTS_NOT_EXISTS", 404);
  }
};

export default DeleteCampaignContactsService;
