import { Router } from "express";
import * as FacebookController from "../controllers/facebookController";

const fbRoutes = Router();

fbRoutes.post("/fb/register-pages", FacebookController.store);

export default fbRoutes;
