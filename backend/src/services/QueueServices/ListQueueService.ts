import Queue from "../../models/Queue";

interface Response {
  queueData: Queue[];
}
const ListQueueService = async (): Promise<Response> => {
  const queueData = await Queue.findAll({
    order: [["queue", "ASC"]]
  });

  return { queueData };
};

export default ListQueueService;
