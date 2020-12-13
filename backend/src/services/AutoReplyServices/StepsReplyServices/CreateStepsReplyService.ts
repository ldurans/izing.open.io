// import AppError from "../../errors/AppError";
import StepsReply from "../../../models/StepsReply";

interface Request {
  reply: string;
  idAutoReply: number;
  userId?: number;
  initialStep: boolean;
}

const CreateStepsReplyService = async ({
  reply,
  idAutoReply,
  userId,
  initialStep
}: Request): Promise<StepsReply> => {
  const stepsReply = await StepsReply.create({
    reply,
    idAutoReply,
    userId,
    initialStep
  });

  return stepsReply;
};

export default CreateStepsReplyService;
