// import { Op } from "sequelize";
import AutoReply from "../../models/AutoReply";
import StepsReply from "../../models/StepsReply";
import AppError from "../../errors/AppError";
// import User from "../../models/User";

const ShowStepAutoReplyMessageService = async (
  action: number,
  idAutoReply: number,
  stepId: number,
  initialStep = false,
  tenantId: number | string
): Promise<StepsReply> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (initialStep) {
    where.initialStep = initialStep;
  } else {
    where.idAutoReply = idAutoReply;
    where.id = stepId;
  }
  const stepReply = await StepsReply.findOne({
    // attributes: ["id", "reply", "stepOrder"],
    where,
    include: [
      {
        model: AutoReply,
        where: { action, tenantId } // action 0 - AutoReply Criacao ticket ou 1 - Resolução do ticket
        // attributes: ["id", "name"]
      }
    ]
    // logging: console.log
  });
  if (!stepReply) {
    throw new AppError("ERR_NO_STEP_AUTO_REPLY_FOUND", 404);
  }

  return stepReply;
};

export default ShowStepAutoReplyMessageService;
