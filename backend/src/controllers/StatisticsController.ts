// import Contact from '../models/Contact';
import { Request, Response } from "express";
import TicketsQueuesService from "../services/Statistics/TicketsQueuesService";

type IndexQuery = {
  dateStart: string;
  dateEnd: string;
  status: string[];
  queuesIds: string[];
  showAll: string;
};

export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, profile, id: userId } = req.user;
  const {
    dateStart,
    dateEnd,
    status,
    queuesIds,
    showAll
  } = req.query as IndexQuery;

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
