import { Request, Response } from "express";
// import * as Yup from "yup";
import StatisticsPerUser from "../../services/Statistics/StatisticsPerUsers";
// import AppError from "../errors/AppError";

type IndexQuery = {
  startDate: string;
  endDate: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;

  const data = await StatisticsPerUser({
    startDate,
    endDate,
    tenantId
  });

  return res.json(data);
};
