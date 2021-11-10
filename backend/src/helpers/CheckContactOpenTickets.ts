import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";

const CheckContactOpenTickets = async (contactId: number): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { contactId, status: { [Op.or]: ["open", "pending"] } }
  });

  if (ticket) {
    // throw new AppError("ERR_OTHER_OPEN_TICKET", );
    throw new AppError(JSON.stringify(ticket), 409);
  }
};

export default CheckContactOpenTickets;
