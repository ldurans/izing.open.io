import { Router } from "express";
import * as FacebookController from "../controllers/facebookController";
import isAuth from "../middleware/isAuth";

const fbRoutes = Router();

fbRoutes.post("/fb/register-pages", isAuth, FacebookController.store);
fbRoutes.post("/fb/logout-pages", isAuth, FacebookController.facebookLogout);

export default fbRoutes;
