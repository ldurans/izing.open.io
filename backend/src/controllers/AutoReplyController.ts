import * as Yup from "yup";
import { Request, Response } from "express";

import CreateAutoReplyService from "../services/AutoReplyServices/CreateAutoReplyService";
import AppError from "../errors/AppError";
import ListAutoReplyService from "../services/AutoReplyServices/ListAutoReplyService";
import UpdateAutoReplyService from "../services/AutoReplyServices/UpdateAutoReplyService";
import DeleteAutoReplyService from "../services/AutoReplyServices/DeleteAutoReplyService";

interface AutoReplyData {
  name: string;
  action: number;
  userId: number;
  isActive: boolean;
  celularTeste?: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newAutoReply: AutoReplyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(newAutoReply);
  } catch (error) {
    throw new AppError(error.message);
  }

  const autoReply = await CreateAutoReplyService(newAutoReply);

  return res.status(200).json(autoReply);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const autoReply = await ListAutoReplyService();
  return res.status(200).json(autoReply);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const autoReplyData: AutoReplyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(autoReplyData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { autoReplyId } = req.params;
  const autoReply = await UpdateAutoReplyService({
    autoReplyData,
    autoReplyId
  });

  return res.status(200).json(autoReply);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { autoReplyId } = req.params;

  await DeleteAutoReplyService(autoReplyId);
  return res.status(200).json({ message: "Auto reply deleted" });
};
