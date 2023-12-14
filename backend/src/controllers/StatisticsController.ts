// import Contact from '../models/Contact';
import { Request, Response } from "express";
import TicketsQueuesService from "../services/Statistics/TicketsQueuesService";
import ContactsReportService from "../services/Statistics/ContactsReportService";
import AppError from "../errors/AppError";

type IndexQuery = {
  dateStart: string;
  dateEnd: string;
  status: string[];
  queuesIds: string[];
  showAll: string;
};

type tContactReport = {
  startDate: string;
  endDate: string;
  tags?: number[] | string[];
  ddds?: number[] | string[];
  searchParam?: string;
};

export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, profile, id: userId } = req.user;
  const { dateStart, dateEnd, status, queuesIds, showAll } =
    req.query as IndexQuery;

  const tickets = await TicketsQueuesService({
    showAll: profile === "admin" ? showAll : false,
    dateStart,
    dateEnd,
    status,
    queuesIds,
    userId,
    tenantId
  });

  return res.status(200).json(tickets);
};

export const ContactsReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }
  const { startDate, endDate, tags, ddds, searchParam } =
    req.query as tContactReport;

  const tickets = await ContactsReportService({
    startDate,
    endDate,
    tags,
    ddds,
    tenantId,
    profile: req.user.profile,
    userId: +req.user.id,
    searchParam
  });

  return res.status(200).json(tickets);
};
