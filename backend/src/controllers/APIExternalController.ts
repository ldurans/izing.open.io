import * as Yup from "yup";
import { Request, Response } from "express";
import isValid from "is-base64";

import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";

interface MessageDataRequest {
  apiId: string;
  sessionId: number;
  body: string;
  number: string;
  media?: string;
  externalKey: string;
  tenantId: number;
}

export const sendMessageAPI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, apiId, sessionId } = req.APIAuth;
  const apiIdParam = req.params.apiId;

  // eslint-disable-next-line eqeqeq
  if (!apiIdParam || apiId != apiIdParam) {
    throw new AppError("ERR_APIID_NO_PERMISSION", 403);
  }

  const APIConfig = await ApiConfig.findByPk(apiId);

  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const newMessage: MessageDataRequest = {
    ...req.body,
    apiId,
    sessionId,
    tenantId
  };

  const schema = Yup.object().shape({
    apiId: Yup.string(),
    sessionId: Yup.number(),
    body: Yup.string().required(),
    number: Yup.string().required(),
    media: Yup.string().nullable(),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newMessage);
  } catch (error) {
    throw new AppError(error.message);
  }

  if (!isValid(newMessage.media || "", { mimeRequired: true })) {
    throw new AppError("Base64 is not valid.", 404);
  }

  Queue.add("SendMessageAPI", newMessage);

  return res.status(200);
};
