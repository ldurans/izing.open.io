// import AppError from "../../errors/AppError";
// import socketEmit from "../../helpers/socketEmit";
import LogTicket from "../../models/LogTicket";

type logType =
  | "access"
  | "create"
  | "closed"
  | "transfered"
  | "receivedTransfer"
  | "open"
  | "pending"
  | "queue"
  | "userDefine"
  | "delete"
  | "chatBot"
  | "autoClose"
  | "retriesLimitQueue"
  | "retriesLimitUserDefine";

interface Request {
  type: logType;
  ticketId: number | string;
  userId?: number | string;
  queueId?: number | string;
}

const CreateLogTicketService = async ({
  type,
  userId,
  ticketId,
  queueId
}: Request): Promise<void> => {
  await LogTicket.create({
    userId,
    ticketId,
    type,
    queueId
  });

  // socketEmit({
  //   tenantId,
  //   type: "ticket:update",
  //   payload: ticket
  // });
};

export default CreateLogTicketService;
