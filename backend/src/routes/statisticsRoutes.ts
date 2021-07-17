import express from "express";
import isAuth from "../middleware/isAuth";

import * as StatisticsController from "../controllers/StatisticsController";
import * as StatisticsPerUsersController from "../controllers/Statistics/StatisticsPerUsersController";

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

statisticsRoutes.get(
  "/statistics-per-users",
  isAuth,
  StatisticsPerUsersController.index
);

export default statisticsRoutes;
