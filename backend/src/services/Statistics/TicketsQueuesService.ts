import { Op, Filterable } from "sequelize";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UsersQueues";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";

interface Request {
  dateStart: string;
  dateEnd: string;
  status?: string[];
  userId: string;
  queuesIds?: string[];
  tenantId: string | number;
  showAll?: string | boolean;
}

const TicketsQueuesService = async ({
  dateStart,
  dateEnd,
  status,
  userId,
  queuesIds,
  tenantId,
  showAll
}: Request): Promise<Ticket[]> => {
  let whereCondition: Filterable["where"] = {
    // [Op.or]: [{ userId }, { status: "pending" }]
  };

  const includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    },
    {
      association: "whatsapp",
      attributes: ["id", "name"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "profile"]
    }
  ];

  const isExistsQueues = await Queue.count({ where: { tenantId } });
  // eslint-disable-next-line eqeqeq
  if (isExistsQueues) {
    const queues = await UsersQueues.findAll({
      where: {
        userId
      }
    });
    let queuesIdsUser = queues.map(q => q.queueId);

    if (queuesIds) {
      const newArray: number[] = [];
      queuesIds.forEach(i => {
        const idx = queuesIdsUser.indexOf(+i);
        if (idx) {
          newArray.push(+i);
        }
      });
      queuesIdsUser = newArray;
    }

    whereCondition = {
      ...whereCondition,
      queueId: {
        [Op.in]: queuesIdsUser
      }
    };
  }

  // eslint-disable-next-line eqeqeq
  if (showAll == "true") {
    whereCondition = {};
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  } else {
    status = ["open", "pending"];
    // throw new AppError("ERR_NO_STATUS_SELECTED", 404);
  }

  if (dateStart && dateEnd) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [
          +startOfDay(parseISO(dateStart)),
          +endOfDay(parseISO(dateEnd))
        ]
      }
    };
  }

  const tickets = await Ticket.findAll({
    where: {
      ...whereCondition,
      // queueId: {
      //   [Op.in]: queuesIdsUser
      // },
      tenantId
    },
    include: includeCondition,
    order: [["updatedAt", "DESC"]]
  });

  return tickets;
};

export default TicketsQueuesService;
