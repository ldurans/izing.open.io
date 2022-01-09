import Message from "../models/Message";

const getQuotedForMessageId = async (
  messageId: string
): Promise<Message | null> => {
  const message = await Message.findOne({
    where: {
      messageId
    }
  });
  return message;
};

export default getQuotedForMessageId;
