import AppError from "../../../errors/AppError";
import StepsReply from "../../../models/StepsReply";

interface StepsReplyData {
  reply: string;
  userId: number;
  initialStep: boolean;
}

interface Request {
  stepsReplyData: StepsReplyData;
  stepsReplyId: string;
}

const UpdateStepsReplyService = async ({
  stepsReplyData,
  stepsReplyId
}: Request): Promise<StepsReply> => {
  const { reply, userId, initialStep } = stepsReplyData;

  const stepsReply = await StepsReply.findOne({
    where: { id: stepsReplyId },
    attributes: ["id", "reply", "userId", "initialStep"]
  });

  if (!stepsReply) {
    throw new AppError("ERR_NO_STEP_AUTO_REPLY_FOUND", 404);
  }

  await stepsReply.update({
    reply,
    userId,
    initialStep
  });

  await stepsReply.reload({
    attributes: ["id", "reply", "userId", "initialStep"]
  });

  return stepsReply;
};

export default UpdateStepsReplyService;
