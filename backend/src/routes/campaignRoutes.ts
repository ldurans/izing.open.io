import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as CampaignController from "../controllers/CampaignController";

const campaignsRoutes = express.Router();
const upload = multer(uploadConfig);

campaignsRoutes.post(
  "/campaigns",
  isAuth,
  upload.array("medias"),
  CampaignController.store
);
campaignsRoutes.get("/campaigns", isAuth, CampaignController.index);
campaignsRoutes.put(
  "/campaigns/:campaignId",
  isAuth,
  upload.array("medias"),
  CampaignController.update
);
campaignsRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.remove
);

campaignsRoutes.post(
  "/campaigns/start/:campaignId",
  isAuth,
  CampaignController.startCampaign
);

campaignsRoutes.post(
  "/campaigns/cancel/:campaignId",
  isAuth,
  CampaignController.cancelCampaign
);

export default campaignsRoutes;
