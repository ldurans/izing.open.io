/* eslint-disable no-restricted-syntax */
import { promisify } from "util";
import { join } from "path";
import { writeFile } from "fs";
import ChatFlow from "../../models/ChatFlow";
import AppError from "../../errors/AppError";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const writeFileAsync = promisify(writeFile);

interface ChatFlowData {
  flow: any;
  name: string;
  userId: number;
  isActive: boolean;
  celularTeste?: string;
}

interface Request {
  chatFlowData: ChatFlowData;
  chatFlowId: string;
  tenantId: string | number;
}

const UpdateChatFlowService = async ({
  chatFlowData,
  chatFlowId,
  tenantId
}: Request): Promise<ChatFlow> => {
  const { name, flow, userId, isActive, celularTeste } = chatFlowData;

  const cahtFlow = await ChatFlow.findOne({
    where: { id: chatFlowId, tenantId },
    attributes: ["id", "name", "flow", "userId", "isActive", "celularTeste"]
  });

  if (!cahtFlow) {
    throw new AppError("ERR_NO_CHAT_FLOW_FOUND", 404);
  }

  for await (const node of flow.flow.nodeList) {
    if (node.type === "node") {
      for await (const item of node.interactions) {
        if (item.type === "MediaField" && item.data.media) {
          const newName = `${new Date().getTime()}-${item.data.name}`;
          await writeFileAsync(
            join(__dirname, "..", "..", "..", "public", newName),
            item.data.media.split("base64")[1],
            "base64"
          );

          delete item.data.media;
          item.data.mediaUrl = newName;
        }
      }
    }
  }

  await cahtFlow.update({
    name,
    flow: flow.flow,
    userId,
    isActive,
    celularTeste
  });

  await cahtFlow.reload({
    attributes: ["id", "name", "flow", "userId", "isActive", "celularTeste"]
  });

  return cahtFlow;
};

export default UpdateChatFlowService;
