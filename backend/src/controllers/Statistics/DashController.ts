import { Request, Response } from "express";
// import * as Yup from "yup";
import DashTicketsAndTimes from "../../services/Statistics/DashTicketsAndTimes";
import DashTicketsChannels from "../../services/Statistics/DashTicketsChannels";
import DashTicketsEvolutionChannels from "../../services/Statistics/DashTicketsEvolutionChannels";
import DashTicketsEvolutionByPeriod from "../../services/Statistics/DashTicketsEvolutionByPeriod";
import DashTicketsPerUsersDetail from "../../services/Statistics/DashTicketsPerUsersDetail";
import DashTicketsQueue from "../../services/Statistics/DashTicketsQueue";
// import AppError from "../errors/AppError";

type IndexQuery = {
  startDate: string;
  endDate: string;
};

export const getDashTicketsAndTimes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsAndTimes({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};

export const getDashTicketsChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsChannels({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};

export const getDashTicketsEvolutionChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsEvolutionChannels({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};

export const getDashTicketsEvolutionByPeriod = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsEvolutionByPeriod({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};

export const getDashTicketsPerUsersDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsPerUsersDetail({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};

export const getDashTicketsQueue = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { startDate, endDate } = req.query as IndexQuery;
  const userId = req.user.id;
  const userProfile = req.user.profile;

  const data = await DashTicketsQueue({
    startDate,
    endDate,
    tenantId,
    userId,
    userProfile
  });

  return res.json(data);
};
