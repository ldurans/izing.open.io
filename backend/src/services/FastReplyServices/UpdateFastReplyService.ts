import AppError from "../../errors/AppError";
import FastReply from "../../models/FastReply";

interface FastReplyData {
  key: string;
  message: string;
  userId: number;
  tenantId: number | string;
}

interface Request {
  fastReplyData: FastReplyData;
  fastReplyId: string;
}

const UpdateFastReplyService = async ({
  fastReplyData,
  fastReplyId
}: Request): Promise<FastReply> => {
  const { key, message, userId, tenantId } = fastReplyData;

  const fastReplyModel = await FastReply.findOne({
    where: { id: fastReplyId, tenantId },
    attributes: ["id", "key", "message", "userId"]
  });

  if (!fastReplyModel) {
    throw new AppError("ERR_NO_FAST_REPLY_FOUND", 404);
  }

  await fastReplyModel.update({
    key,
    message,
    userId
  });

  await fastReplyModel.reload({
    attributes: ["id", "key", "message", "userId"]
  });

  return fastReplyModel;
};

export default UpdateFastReplyService;
