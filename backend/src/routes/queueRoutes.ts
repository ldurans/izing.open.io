import express from "express";
import isAuth from "../middleware/isAuth";

import * as QueueController from "../controllers/QueueController";

const queueRoutes = express.Router();

queueRoutes.post("/queue", isAuth, QueueController.store);
queueRoutes.get("/queue", isAuth, QueueController.index);
queueRoutes.put("/queue/:queueId", isAuth, QueueController.update);
queueRoutes.delete("/queue/:queueId", isAuth, QueueController.remove);

export default queueRoutes;
