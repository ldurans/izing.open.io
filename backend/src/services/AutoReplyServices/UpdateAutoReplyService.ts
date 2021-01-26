import AppError from "../../errors/AppError";
import AutoReply from "../../models/AutoReply";

interface AutoReplyData {
  name: string;
  action: number;
  userId: number;
  isActive: boolean;
  celularTeste?: string;
}

interface Request {
  autoReplyData: AutoReplyData;
  autoReplyId: string;
  tenantId: string | number;
}

const UpdateAutoReplyService = async ({
  autoReplyData,
  autoReplyId,
  tenantId
}: Request): Promise<AutoReply> => {
  const { name, action, userId, isActive, celularTeste } = autoReplyData;

  const autoReply = await AutoReply.findOne({
    where: { id: autoReplyId, tenantId },
    attributes: ["id", "name", "action", "userId", "isActive", "celularTeste"]
  });

  if (!autoReply) {
    throw new AppError("ERR_NO_AUTO_REPLY_FOUND", 404);
  }

  await autoReply.update({
    name,
    action,
    userId,
    isActive,
    celularTeste
  });

  await autoReply.reload({
    attributes: ["id", "name", "action", "userId", "isActive", "celularTeste"]
  });

  return autoReply;
};

export default UpdateAutoReplyService;
