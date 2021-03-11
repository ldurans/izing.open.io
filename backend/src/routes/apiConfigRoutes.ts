import express from "express";
import isAuth from "../middleware/isAuth";

import * as APIConfigController from "../controllers/APIConfigController";

const apiConfigRoutes = express.Router();

apiConfigRoutes.post("/api-config", isAuth, APIConfigController.store);
apiConfigRoutes.get("/api-config", isAuth, APIConfigController.index);
apiConfigRoutes.put("/api-config/:apiId", isAuth, APIConfigController.update);
apiConfigRoutes.delete(
  "/api-config/:apiId",
  isAuth,
  APIConfigController.remove
);
apiConfigRoutes.put(
  "/api-config/renew-token/:apiId",
  isAuth,
  APIConfigController.renewTokenApi
);
export default apiConfigRoutes;
