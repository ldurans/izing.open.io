/* eslint-disable no-restricted-syntax */
import { promisify } from "util";
import { writeFile } from "fs";
import ChatFlow from "../../models/ChatFlow";
import AppError from "../../errors/AppError";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const writeFileAsync = promisify(writeFile);

interface Request {
  id: string | number;
  tenantId: string | number;
}

const DeleteChatFlowService = async ({
  id,
  tenantId
}: Request): Promise<void> => {
  const cahtFlow = await ChatFlow.findOne({
    where: { id, tenantId }
  });

  if (!cahtFlow) {
    throw new AppError("ERR_NO_CHAT_FLOW_FOUND", 404);
  }

  await cahtFlow.update({
    isActive: false,
    isDeleted: true
  });

  await cahtFlow.reload({
    attributes: ["isActive", "isDeleted"]
  });
};

export default DeleteChatFlowService;
