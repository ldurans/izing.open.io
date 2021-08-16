import LogTicket from "../../models/LogTicket";
import User from "../../models/User";
import Queue from "../../models/Queue";

interface Request {
  ticketId: string | number;
}

const ShowLogTicketService = async ({
  ticketId
}: Request): Promise<LogTicket[]> => {
  const logs = await LogTicket.findAll({
    where: {
      ticketId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "queue"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return logs;
};

export default ShowLogTicketService;
