// import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface Request {
  queue: string;
  isActive: boolean;
  userId: number;
}

const CreateQueueService = async ({
  queue,
  isActive,
  userId
}: Request): Promise<Queue> => {
  const queueData = await Queue.create({
    queue,
    isActive,
    userId
  });

  return queueData;
};

export default CreateQueueService;
