import express from "express";
// import isAuth from "../middleware/isAuth";

import * as HooksController from "../controllers/WebHooksController";

const webHooksRoutes = express.Router();

webHooksRoutes.post("/wabahooks/:token", HooksController.ReceivedRequest);

export default webHooksRoutes;
