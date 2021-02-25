import * as Yup from "yup";
import { Request, Response } from "express";
import { isMatch } from "date-fns";
import AppError from "../errors/AppError";

import UpdateBusinessHoursService from "../services/TenantServices/UpdateBusinessHoursService";
import ShowBusinessHoursAndMessageService from "../services/TenantServices/ShowBusinessHoursAndMessageService";
import UpdateMessageBusinessHoursService from "../services/TenantServices/UpdateMessageBusinessHoursService";

export const updateBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const businessHours = req.body;

  const schema = Yup.array().of(
    Yup.object().shape({
      day: Yup.number().required().integer(),
      label: Yup.string().required(),
      type: Yup.string().required(),
      hr1: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        ),
      hr2: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value => {
          return isMatch(value || "", "HH:mm");
        }),
      hr3: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        ),
      hr4: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        )
    })
  );

  try {
    await schema.validate(businessHours);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newBusinessHours = await UpdateBusinessHoursService({
    businessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours);
};

export const updateMessageBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { messageBusinessHours } = req.body;

  if (!messageBusinessHours) {
    throw new AppError("ERR_NO_MESSAGE_INFORMATION", 404);
  }

  const newBusinessHours = await UpdateMessageBusinessHoursService({
    messageBusinessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours);
};

export const showBusinessHoursAndMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  const tenant = await ShowBusinessHoursAndMessageService({ tenantId });

  return res.status(200).json(tenant);
};
