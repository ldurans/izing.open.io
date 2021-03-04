// import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignContactsService from "../services/CampaignContactsServices/CreateCampaignContactsService";
import ListCampaignContactsService from "../services/CampaignContactsServices/ListCampaignContactsService";
import DeleteCampaignContactsService from "../services/CampaignContactsServices/DeleteCampaignContactsService";
import DeleteAllCampaignContactsService from "../services/CampaignContactsServices/DeleteAllCampaignContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  // const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const contacts = [...req.body];
  const { campaignId } = req.params;

  const cc = await CreateCampaignContactsService({
    campaignContacts: contacts,
    campaignId
  });

  return res.status(200).json(cc);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { campaignId } = req.params;
  const tags = await ListCampaignContactsService({
    campaignId,
    tenantId
    // eslint-disable-next-line eqeqeq
  });
  return res.status(200).json(tags);
};

// export const update = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { tenantId } = req.user;

//   if (req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }
//   const tagData: TagData = { ...req.body, userId: req.user.id, tenantId };

//   const schema = Yup.object().shape({
//     tag: Yup.string().required(),
//     color: Yup.string().required(),
//     isActive: Yup.boolean().required(),
//     userId: Yup.number().required()
//   });

//   try {
//     await schema.validate(tagData);
//   } catch (error) {
//     throw new AppError(error.message);
//   }

//   const { tagId } = req.params;
//   const tagObj = await UpdateTagService({
//     tagData,
//     tagId
//   });

//   return res.status(200).json(tagObj);
// };

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId, contactId } = req.params;

  await DeleteCampaignContactsService({ campaignId, contactId, tenantId });
  return res.status(200).json({ message: "Campagin Contact deleted" });
};

export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await DeleteAllCampaignContactsService({ campaignId, tenantId });
  return res.status(200).json({ message: "Campagin Contacts deleted" });
};
