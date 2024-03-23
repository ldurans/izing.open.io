import User from "../../models/User";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import UpdateDeletedUserOpenTicketsStatus from "../../helpers/UpdateDeletedUserOpenTicketsStatus";

const DeleteUserService = async (
  id: string | number,
  tenantId: string | number,
  userIdRequest: string | number
): Promise<void> => {
  const user = await User.findOne({
    where: { id, tenantId }
  });

  if (!user || tenantId !== user.tenantId) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const userOpenTickets: Ticket[] = await user.$get("tickets", {
    where: { status: "open", tenantId }
  });

  if (userOpenTickets.length > 0) {
    UpdateDeletedUserOpenTicketsStatus(
      userOpenTickets,
      tenantId,
      userIdRequest
    );
  }
  
    try {
    await user.destroy();
  } catch (error) {
    throw new AppError("ERROR_USER_MESSAGES_NOT_EXISTS", 404);
  }
  
};

export default DeleteUserService;
