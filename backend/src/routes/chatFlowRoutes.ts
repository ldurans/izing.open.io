import express from "express";
import isAuth from "../middleware/isAuth";

import * as ChatFlowController from "../controllers/ChatFlowController";

const chatFlowRoutes = express.Router();

chatFlowRoutes.post("/chat-flow", isAuth, ChatFlowController.store);
chatFlowRoutes.get("/chat-flow", isAuth, ChatFlowController.index);
chatFlowRoutes.put("/chat-flow/:chatFlowId", isAuth, ChatFlowController.update);
chatFlowRoutes.delete(
  "/chat-flow/:chatFlowId",
  isAuth,
  ChatFlowController.remove
);
// chatFlowRoutes.delete(
//   "/auto-reply/:autoReplyId",
//   isAuth,
//   AutoReplyController.remove
// );

export default chatFlowRoutes;
