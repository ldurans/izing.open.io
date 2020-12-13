// import AppError from "../../errors/AppError";
import AutoReply from "../../models/AutoReply";

interface Request {
  name: string;
  action: number;
  userId: number;
}

const CreateAutoReplyService = async ({
  name,
  action,
  userId
}: Request): Promise<AutoReply> => {
  const autoReply = await AutoReply.create({
    name,
    action,
    userId
  });

  return autoReply;
};

export default CreateAutoReplyService;
