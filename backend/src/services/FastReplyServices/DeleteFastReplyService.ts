import AppError from "../../errors/AppError";
import FastReply from "../../models/FastReply";

interface Request {
  id: string;
  tenantId: number | string;
}

const DeleteFastReplyService = async ({
  id,
  tenantId
}: Request): Promise<void> => {
  const reply = await FastReply.findOne({
    where: { id, tenantId }
  });

  if (!reply) {
    throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
  }
  try {
    await reply.destroy();
  } catch (error) {
    throw new AppError("ERR_FAST_REPLY_EXISTS", 404);
  }
};

export default DeleteFastReplyService;
