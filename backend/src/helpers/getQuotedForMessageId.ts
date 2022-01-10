import Message from "../models/Message";

const getQuotedForMessageId = async (
  messageId: string,
  tenantId: string | number
): Promise<Message | null> => {
  const message = await Message.findOne({
    where: {
      messageId: String(messageId),
      tenantId: +tenantId
    }
  });
  return message;
};

export default getQuotedForMessageId;
