/* eslint-disable array-callback-return */
// import AppError from "../../errors/AppError";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CampaignContacts from "../../models/CampaignContacts";

interface CampaignContact {
  campaignId: string | number;
  contactId: string | number;
}

interface Request {
  campaignContacts: CampaignContact[];
  campaignId: string | number;
}

interface CampaignContactData {
  campaignId: string | number;
  contactId: string | number;
}

const CreateCampaignContactsService = async ({
  campaignContacts,
  campaignId
}: Request): Promise<void> => {
  const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const isCreateds = await CampaignContacts.findAll({
    where: {
      campaignId
    }
  });

  const data: CampaignContactData[] = campaignContacts.map((contact: any) => {
    return {
      contactId: contact.id,
      campaignId,
      messageRandom: `message${randomInteger(1, 3)}`
    };
  });

  // eslint-disable-next-line consistent-return
  const filterData = data.filter((d: any): any => {
    const isExists = isCreateds?.findIndex(
      (c: any) => d.contactId === c.contactId && +campaignId === c.campaignId
    );
    if (isExists === -1) {
      return d;
    }
  });

  const schema = Yup.array().of(
    Yup.object().shape({
      messageRandom: Yup.string().required(),
      campaignId: Yup.number().required(),
      contactId: Yup.number().required()
    })
  );

  try {
    await schema.validate(filterData);
  } catch (error) {
    throw new AppError(error.message);
  }

  try {
    await CampaignContacts.bulkCreate(filterData);
  } catch (error) {
    throw new AppError(error.message);
  }
};

export default CreateCampaignContactsService;
