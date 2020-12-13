import Queue from "../../models/Queue";
import AppError from "../../errors/AppError";

const DeleteQueueService = async (id: string): Promise<void> => {
  const queue = await Queue.findOne({
    where: { id }
  });

  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }
  try {
    await queue.destroy();
  } catch (error) {
    throw new AppError("ERR_QUEUE_TICKET_EXISTS", 404);
  }
};

export default DeleteQueueService;
