import express from "express";
import isAuth from "../middleware/isAuth";

import * as StatisticsController from "../controllers/StatisticsController";

const statisticsRoutes = express.Router();

statisticsRoutes.get(
  "/dash-tickets-queues",
  isAuth,
  StatisticsController.DashTicketsQueues
);

export default statisticsRoutes;
