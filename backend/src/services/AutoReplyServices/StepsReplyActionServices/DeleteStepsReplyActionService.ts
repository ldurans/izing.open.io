import StepsReplyAction from "../../../models/StepsReplyAction";
import AppError from "../../../errors/AppError";

const DeleteStepsReplyActionService = async (id: string): Promise<void> => {
  const stepsReplyAction = await StepsReplyAction.findOne({
    where: { id }
  });

  if (!stepsReplyAction) {
    throw new AppError("ERR_NO_STEPS_REPLY_FOUND", 404);
  }

  await stepsReplyAction.destroy();
};

export default DeleteStepsReplyActionService;
