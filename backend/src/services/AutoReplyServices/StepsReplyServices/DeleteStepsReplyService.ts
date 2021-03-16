import StepsReply from "../../../models/StepsReply";
import AppError from "../../../errors/AppError";

const DeleteStepsReplyService = async (id: string): Promise<void> => {
  const stepsReply = await StepsReply.findOne({
    where: { id }
  });

  if (!stepsReply) {
    throw new AppError("ERR_NO_STEP_AUTO_REPLY_FOUND", 404);
  }

  await stepsReply.destroy();
};

export default DeleteStepsReplyService;
