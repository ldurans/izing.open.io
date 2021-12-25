import express from "express";
// import isAuth from "../middleware/isAuth";

import * as HooksController from "../controllers/WebHooksController";

const webHooksRoutes = express.Router();

// 360 === wabaBSP da tabela whatsapps
webHooksRoutes.post(
  "/wabahooks/360/:token",
  HooksController.ReceivedRequest360
);

export default webHooksRoutes;
