import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateTagService from "../services/TagServices/CreateTagService";
import ListTagService from "../services/TagServices/ListTagService";
import DeleteTagService from "../services/TagServices/DeleteTagService";
import UpdateTagService from "../services/TagServices/UpdateTagService";

interface TagData {
  tag: string;
  color: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newTag: TagData = { ...req.body, userId: req.user.id, tenantId };

  const schema = Yup.object().shape({
    tag: Yup.string().required(),
    color: Yup.string().required(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newTag);
  } catch (error) {
    throw new AppError(error.message);
  }

  const tag = await CreateTagService(newTag);

  return res.status(200).json(tag);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { isActive } = req.query;
  const tags = await ListTagService({
    tenantId,
    // eslint-disable-next-line eqeqeq
    isActive: isActive ? isActive == "true" : false
  });
  return res.status(200).json(tags);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const tagData: TagData = { ...req.body, userId: req.user.id, tenantId };

  const schema = Yup.object().shape({
    tag: Yup.string().required(),
    color: Yup.string().required(),
    isActive: Yup.boolean().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(tagData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { tagId } = req.params;
  const tagObj = await UpdateTagService({
    tagData,
    tagId
  });

  return res.status(200).json(tagObj);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tagId } = req.params;

  await DeleteTagService({ id: tagId, tenantId });
  return res.status(200).json({ message: "Tag deleted" });
};
