// import AppError from "../../errors/AppError";
import StepsReplyAction from "../../../models/StepsReplyAction";

interface Request {
  stepReplyId: number;
  words: string;
  action: number;
  userId: number;
  queueId?: number;
  userIdDestination?: number;
  nextStepId?: number;
  replyDefinition?: string;
}

const CreateStepsReplyActionService = async ({
  stepReplyId,
  words,
  action,
  userId,
  queueId,
  userIdDestination,
  nextStepId,
  replyDefinition
}: Request): Promise<StepsReplyAction> => {
  const stepsReplyAction = await StepsReplyAction.create({
    stepReplyId,
    words,
    action,
    userId,
    queueId,
    userIdDestination,
    nextStepId,
    replyDefinition
  });

  return stepsReplyAction;
};

export default CreateStepsReplyActionService;
