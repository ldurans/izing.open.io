import express from "express";
import isAuth from "../middleware/isAuth";

import * as TenantController from "../controllers/TenantController";

const tenantRoutes = express.Router();

// tenantRoutes.post("/tenants", isAuth, TenantController.store);
tenantRoutes.get(
  "/tenants/business-hours/",
  isAuth,
  TenantController.showBusinessHoursAndMessage
);
tenantRoutes.put(
  "/tenants/business-hours/",
  isAuth,
  TenantController.updateBusinessHours
);
tenantRoutes.put(
  "/tenants/message-business-hours/",
  isAuth,
  TenantController.updateMessageBusinessHours
);
// tenantRoutes.delete("/tenants/:tagId", isAuth, TenantController.remove);

export default tenantRoutes;
