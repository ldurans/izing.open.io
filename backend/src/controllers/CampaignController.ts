import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignService from "../services/CampaignServices/CreateCampaignService";
import ListCampaignService from "../services/CampaignServices/ListCampaignService";
import DeleteCampaignService from "../services/CampaignServices/DeleteCampaignService";
import UpdateCampaignService from "../services/CampaignServices/UpdateCampaignService";
import StartCampaignService from "../services/CampaignServices/StartCampaignService";
import CancelCampaignService from "../services/CampaignServices/CancelCampaignService";

interface CampaignData {
  name: string;
  start: string;
  end: string;
  message1: string;
  message2: string;
  message3: string;
  mediaUrl: string;
  userId: string;
  sessionId: string;
  delay: string;
  tenantId: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const medias = req.files as Express.Multer.File[];
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const campaign: CampaignData = {
    ...req.body,
    userId: req.user.id,
    tenantId
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string().required(),
    message3: Yup.string().required(),
    userId: Yup.string().required(),
    sessionId: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(campaign);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newCampaign = await CreateCampaignService({
    campaign,
    medias
  });

  return res.status(200).json(newCampaign);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const tags = await ListCampaignService({
    tenantId
  });
  return res.status(200).json(tags);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const medias = req.files as Express.Multer.File[];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaignData: CampaignData = {
    ...req.body,
    userId: req.user.id,
    tenantId
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string().required(),
    message3: Yup.string().required(),
    mediaUrl: Yup.string().required(),
    userId: Yup.string().required(),
    sessionId: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { campaignId } = req.params;
  const campaignObj = await UpdateCampaignService({
    campaignData,
    medias,
    campaignId,
    tenantId
  });

  return res.status(200).json(campaignObj);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await DeleteCampaignService({ id: campaignId, tenantId });
  return res.status(200).json({ message: "Campaign deleted" });
};

export const startCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await StartCampaignService({
    campaignId,
    tenantId,
    options: {
      delay: 2000
    }
  });

  return res.status(200).json({ message: "Campaign started" });
};

export const cancelCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await CancelCampaignService({
    campaignId,
    tenantId
  });

  return res.status(200).json({ message: "Campaign canceled" });
};
