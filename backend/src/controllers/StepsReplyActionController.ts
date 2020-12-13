import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/CreateStepsReplyActionService";
import DeleteStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/DeleteStepsReplyActionService";
import UpdateStepsReplyActionService from "../services/AutoReplyServices/StepsReplyActionServices/UpdateStepsReplyActionService";

interface StepsReplyActionData {
  stepReplyId: number;
  words: string;
  action: number;
  userId: number;
  queueId?: number;
  userIdDestination?: number;
  nextStepId?: number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const stepsReplyActionData: StepsReplyActionData = {
    ...req.body,
    userId: req.user.id
  };

  const schema = Yup.object().shape({
    stepReplyId: Yup.number().required(),
    words: Yup.number().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(stepsReplyActionData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const stepsReplyAction = await CreateStepsReplyActionService(
    stepsReplyActionData
  );

  return res.status(200).json(stepsReplyAction);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const stepsReplyActionData: StepsReplyActionData = {
    ...req.body,
    userId: req.user.id
  };

  const schema = Yup.object().shape({
    stepReplyId: Yup.number().required(),
    words: Yup.number().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(stepsReplyActionData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { stepsReplyActionId } = req.params;
  const autoReply = await UpdateStepsReplyActionService({
    stepsReplyActionData,
    stepsReplyActionId
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
  const { stepsReplyActionId } = req.params;

  await DeleteStepsReplyActionService(stepsReplyActionId);
  return res.status(200).json({ message: "Auto reply deleted" });
};
