import express from "express";
import isAuth from "../middleware/isAuth";

import * as FastReplyController from "../controllers/FastReplyController";

const fastReplyRoutes = express.Router();

fastReplyRoutes.post("/fastreply", isAuth, FastReplyController.store);
fastReplyRoutes.get("/fastreply", isAuth, FastReplyController.index);
fastReplyRoutes.put(
  "/fastreply/:fastReplyId",
  isAuth,
  FastReplyController.update
);
fastReplyRoutes.delete(
  "/fastreply/:fastReplyId",
  isAuth,
  FastReplyController.remove
);

export default fastReplyRoutes;
