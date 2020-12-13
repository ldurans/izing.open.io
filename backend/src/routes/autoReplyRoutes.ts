import express from "express";
import isAuth from "../middleware/isAuth";

import * as AutoReplyController from "../controllers/AutoReplyController";
import * as StepsReplyController from "../controllers/StepsReplyController";
import * as StepsReplyActionController from "../controllers/StepsReplyActionController";

const autoReplyRoutes = express.Router();

autoReplyRoutes.post("/auto-reply", isAuth, AutoReplyController.store);
autoReplyRoutes.get("/auto-reply", isAuth, AutoReplyController.index);
autoReplyRoutes.put(
  "/auto-reply/:autoReplyId",
  isAuth,
  AutoReplyController.update
);
autoReplyRoutes.delete(
  "/auto-reply/:autoReplyId",
  isAuth,
  AutoReplyController.remove
);

autoReplyRoutes.post(
  "/auto-reply/:idAutoReply/steps",
  isAuth,
  StepsReplyController.store
);
autoReplyRoutes.put(
  "/auto-reply/:idAutoReply/steps/:stepsReplyId",
  isAuth,
  StepsReplyController.update
);
autoReplyRoutes.delete(
  "/auto-reply/:idAutoReply/steps/:stepsReplyId",
  isAuth,
  StepsReplyController.remove
);

autoReplyRoutes.post(
  "/auto-reply-action",
  isAuth,
  StepsReplyActionController.store
);
autoReplyRoutes.put(
  "/auto-reply-action/:stepsReplyActionId",
  isAuth,
  StepsReplyActionController.update
);
autoReplyRoutes.delete(
  "/auto-reply-action/:stepsReplyActionId",
  isAuth,
  StepsReplyActionController.remove
);

export default autoReplyRoutes;
