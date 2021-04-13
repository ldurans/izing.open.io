import AppError from "../../../errors/AppError";
import StepsReplyAction from "../../../models/StepsReplyAction";

interface StepsReplyActionData {
  stepReplyId: number;
  words: string;
  action: number;
  userId: number;
  queueId?: number;
  userIdDestination?: number;
  nextStepId?: number;
  replyDefinition?: string;
}

interface Request {
  stepsReplyActionData: StepsReplyActionData;
  stepsReplyActionId: string;
}

const UpdateStepsReplyActionService = async ({
  stepsReplyActionData,
  stepsReplyActionId
}: Request): Promise<StepsReplyAction> => {
  const {
    stepReplyId,
    words,
    action,
    userId,
    queueId,
    userIdDestination,
    nextStepId,
    replyDefinition
  } = stepsReplyActionData;

  const stepsReplyAction = await StepsReplyAction.findOne({
    where: { id: stepsReplyActionId },
    attributes: [
      "id",
      "stepReplyId",
      "words",
      "action",
      "userId",
      "queueId",
      "userIdDestination",
      "nextStepId",
      "replyDefinition"
    ]
  });

  if (!stepsReplyAction) {
    throw new AppError("ERR_NO_STEP_AUTO_REPLY_FOUND", 404);
  }

  await stepsReplyAction.update({
    stepReplyId,
    words,
    action,
    userId,
    queueId,
    userIdDestination,
    nextStepId,
    replyDefinition
  });

  await stepsReplyAction.reload({
    attributes: [
      "id",
      "stepReplyId",
      "words",
      "action",
      "userId",
      "queueId",
      "userIdDestination",
      "nextStepId",
      "replyDefinition"
    ]
  });

  return stepsReplyAction;
};

export default UpdateStepsReplyActionService;
