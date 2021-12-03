/* eslint-disable no-restricted-syntax */
// import AppError from "../../errors/AppError";
import { promisify } from "util";
import { join } from "path";
import { writeFile } from "fs";
import ChatFlow from "../../models/ChatFlow";
// import { logger } from "../../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const writeFileAsync = promisify(writeFile);

interface Request {
  flow: any;
  name: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
}

const CreateChatFlowService = async ({
  flow,
  userId,
  tenantId,
  name,
  isActive
}: Request): Promise<ChatFlow> => {
  for await (const node of flow.nodeList) {
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
          item.data.fileName = item.data.name;
          item.data.mediaUrl = newName;
        }
      }
    }
  }

  const chatFlow = await ChatFlow.create({
    flow,
    userId,
    tenantId,
    name,
    isActive
  });

  return chatFlow;
};

export default CreateChatFlowService;
