/* eslint-disable eqeqeq */
import { Op, fn, where, col, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import UsersQueues from "../../models/UsersQueues";
import AppError from "../../errors/AppError";
import User from "../../models/User";
import ListSettingsService from "../SettingServices/ListSettingsService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string[];
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  isNotAssignedUser?: string;
  queuesIds?: string[];
  includeNotQueueDefined?: string;
  tenantId: string | number;
  profile: string;
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
  queuesIds,
  isNotAssignedUser,
  includeNotQueueDefined,
  tenantId,
  profile
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"] = {
    // [Op.or]: [{ userId }, { status: "pending" }]
  };
  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "profile"]
    }
  ];

  const isAdminShowAll = showAll == "true" && profile === "admin";

  if (status) {
    whereCondition = {
      ...whereCondition,
      status
    };
  } else if (!isAdminShowAll) {
    throw new AppError("ERR_NO_STATUS_SELECTED", 403);
  }

  // const isTicketClosed = status?.findIndex(s => s === "closed");

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

  if (withUnreadMessages == "true" && !isAdminShowAll) {
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

  if (includeNotQueueDefined == "true" && isNotAssignedUser == "true") {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          queueId: {
            [Op.or]: [{ [Op.in]: queuesIdsUser }, { [Op.is]: null }]
          }
        },
        {
          userId: {
            [Op.is]: null
          }
        }
      ]
    };
  } else if (includeNotQueueDefined == "true" && isNotAssignedUser == "false") {
    whereCondition = {
      ...whereCondition,
      queueId: {
        [Op.or]: [{ [Op.in]: queuesIdsUser }, { [Op.is]: null }]
      }
    };
  } else if (includeNotQueueDefined == "false" && isNotAssignedUser == "true") {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        {
          queueId: {
            [Op.in]: queuesIdsUser
          }
        },
        {
          userId: {
            [Op.is]: null
          }
        }
      ]
    };
  } else {
    whereCondition = {
      ...whereCondition,
      queueId: {
        [Op.in]: queuesIdsUser
      }
    };
  }

  if (isAdminShowAll) {
    whereCondition = {};
  }

  if (searchParam) {
    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
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

  // tratar as configurações do sistema
  const settings = await ListSettingsService(tenantId);
  const NotViewTicketsQueueUndefined =
    settings?.find(s => s.key === "NotViewTicketsQueueUndefined")?.value ||
    "disabled";
  const NotViewAssignedTickets =
    settings?.find(s => s.key === "NotViewAssignedTickets")?.value ||
    "disabled";

  if (NotViewTicketsQueueUndefined === "enabled" && !isAdminShowAll) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [{ queueId: { [Op.ne]: null } }]
    };
  }

  if (NotViewAssignedTickets === "enabled" && !isAdminShowAll) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        {
          userId: {
            [Op.or]: [userId, null]
          }
        }
      ]
    };
  }

  const limit = 50;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: { ...whereCondition, tenantId },
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    logging: console.log
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
