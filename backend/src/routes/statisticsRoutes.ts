import express from "express";
import isAuth from "../middleware/isAuth";

import * as StatisticsController from "../controllers/StatisticsController";

const statisticsRoutes = express.Router();

statisticsRoutes.get(
  "/dash-tickets-queues",
  isAuth,
  StatisticsController.DashTicketsQueues
);

statisticsRoutes.get(
  "/contacts-report",
  isAuth,
  StatisticsController.ContactsReport
);

export default statisticsRoutes;
