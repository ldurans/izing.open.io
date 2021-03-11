import express from "express";
import isAPIAuth from "../middleware/isAPIAuth";

import * as APIExternalController from "../controllers/APIExternalController";

const apiExternalRoute = express.Router();

apiExternalRoute.get(
  "/v1/api/external/:apiIdParam",
  isAPIAuth,
  APIExternalController.sendMessageAPI
);

export default apiExternalRoute;
