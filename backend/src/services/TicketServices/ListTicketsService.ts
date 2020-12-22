import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import UsersQueues from "../../models/UsersQueues";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queue?: string;
  tenantId: string | number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  date,
  showAll,
  userId,
  withUnreadMessages,
  queue,
  tenantId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    [Op.or]: [{ userId }, { status: "pending" }]
  };
  let includeCondition: Includeable[];

  const queues = await UsersQueues.findAll({ where: { userId } });
  const queuesIds = queues.map(q => q.queueId);

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    }
  ];

  if (showAll === "true") {
    whereCondition = {};
  }

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        // where: {
        //   body: where(
        //     fn("LOWER", col("body")),
        //     "LIKE",
        //     `%${sanitizedSearchParam}%`
        //   )
        // },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };
  }

  if (withUnreadMessages === "true") {
    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: [],
        where: {
          read: false,
          fromMe: false
        }
      }
    ];
  }

  if (!searchParam && status !== "closed" /* && profile !== "admin" */) {
    if (queue) {
      whereCondition = {
        ...whereCondition,
        queueId: { [Op.in]: [queue] }
      };
    } else {
      whereCondition = {
        ...whereCondition,
        // [Op.and]: [
        // {
        queueId: {
          [Op.or]: [{ [Op.in]: queuesIds }, { [Op.is]: null }]
        }
        // }
        // ]
      };
    }
  }

  const limit = 50;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: { ...whereCondition, tenantId },
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
