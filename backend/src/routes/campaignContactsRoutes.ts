import express from "express";
import isAuth from "../middleware/isAuth";

import * as CampaignContactsController from "../controllers/CampaignContactsController";

const campaignContactsRoutes = express.Router();

campaignContactsRoutes.post(
  "/campaigns/contacts/:campaignId",
  isAuth,
  CampaignContactsController.store
);
campaignContactsRoutes.get(
  "/campaigns/contacts/:campaignId",
  isAuth,
  CampaignContactsController.index
);
// campaignContactsRoutes.put(
//   "/campaigns/contacts/:campaignContactId",
//   isAuth,
//   CampaignContactsController.update
// );
campaignContactsRoutes.delete(
  "/campaigns/contacts/:campaignId/:contactId",
  isAuth,
  CampaignContactsController.remove
);
campaignContactsRoutes.delete(
  "/campaigns/deleteall/contacts/:campaignId",
  isAuth,
  CampaignContactsController.removeAll
);

export default campaignContactsRoutes;
