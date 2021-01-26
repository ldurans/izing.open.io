import Queue from "../../models/Queue";

interface Response {
  queueData: Queue[];
}

interface Request {
  tenantId: string | number;
}
const ListQueueService = async ({ tenantId }: Request): Promise<Response> => {
  const queueData = await Queue.findAll({
    where: {
      tenantId
    },
    order: [["queue", "ASC"]]
  });

  return { queueData };
};

export default ListQueueService;
