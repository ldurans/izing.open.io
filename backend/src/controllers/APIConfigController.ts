import * as Yup from "yup";
import { Request, Response } from "express";

import CreateApiConfigService from "../services/ApiConfigServices/CreateApiConfigService";
import ListApiConfigService from "../services/ApiConfigServices/ListApiConfigService";
import AppError from "../errors/AppError";
import UpdateApiConfigService from "../services/ApiConfigServices/UpdateApiConfigService";
import DeleteApiConfigService from "../services/ApiConfigServices/DeleteApiConfigService";
import RenewApiConfigTokenService from "../services/ApiConfigServices/RenewApiConfigTokenService";

interface ApiData {
  name: string;
  sessionId: string | number;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  userId: string | number;
  tenantId: string | number;
  authToken?: string;
  isActive?: boolean;
}

interface RenewData {
  sessionId: string | number;
  userId: string | number;
  tenantId: string | number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, id } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newApi: ApiData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    sessionId: Yup.number().required(),
    urlServiceStatus: Yup.string().url().nullable(),
    urlMessageStatus: Yup.string().url().nullable(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newApi);
  } catch (error) {
    throw new AppError(error.message);
  }

  const api = await CreateApiConfigService(newApi);

  return res.status(200).json(api);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const apis = await ListApiConfigService({ tenantId });
  return res.status(200).json(apis);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId, id } = req.user;
  const { apiId } = req.params;

  const apiData: ApiData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    sessionId: Yup.number().required(),
    urlServiceStatus: Yup.string().url().nullable(),
    urlMessageStatus: Yup.string().url().nullable(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required(),
    isActive: Yup.boolean().required()
  });

  try {
    await schema.validate(apiData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const api = await UpdateApiConfigService({
    apiData,
    apiId,
    tenantId
  });

  return res.status(200).json(api);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const { apiId } = req.params;

  await DeleteApiConfigService({ apiId, tenantId });
  return res.status(200).json({ message: "API Config Deleted" });
};

export const renewTokenApi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tenantId, id } = req.user;
  const { apiId } = req.params;

  const api: RenewData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    sessionId: Yup.number().required(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(api);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newApi = await RenewApiConfigTokenService({
    apiId,
    userId: api.userId,
    sessionId: api.sessionId,
    tenantId: api.tenantId
  });

  return res.status(200).json(newApi);
};
