import FastReply from "../../models/FastReply";

interface Request {
  tenantId: string | number;
}

const ListFastReplyService = async ({
  tenantId
}: Request): Promise<FastReply[]> => {
  const fastReplyData = await FastReply.findAll({
    where: {
      tenantId
    },
    order: [["key", "ASC"]]
  });

  return fastReplyData;
};

export default ListFastReplyService;
