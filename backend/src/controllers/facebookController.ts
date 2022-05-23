/* eslint-disable camelcase */
import { Request, Response } from "express";
import GetTokenAndLinkedPage from "../services/FacebookServices/GetTokenAndLinkedPage";
import SetLogoutLinkedPage from "../services/FacebookServices/SetLogoutLinkedPage";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsapp, accountId, userToken } = req.body;

  await GetTokenAndLinkedPage({
    whatsapp,
    accountId,
    userToken,
    tenantId: req.user.tenantId
  });

  return res.status(200).json();
};

export const facebookLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const whatsapp = req.body;

  await SetLogoutLinkedPage({
    whatsapp,
    tenantId: req.user.tenantId
  });

  return res.status(200).json();
};
