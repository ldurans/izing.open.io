import { QueryTypes } from "sequelize";
import User from "../../models/User";
// import AppError from "../../errors/AppError";
// import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";

const DefinedUserBotService = async (
  ticket: Ticket,
  queueId: string | number,
  tenantId: string | number,
  method = "R"
): Promise<void> => {
  // method: R = Random | B = Balanced ;
  // R: pega usuario de forma randomica;
  // B: pega o usuario com menor número de atendimentos;

  if (method === "N") return;

  let query = `
    select u.id from "Users" u
    left join "UsersQueues" uq on (u.id = uq."userId")
    where u."isOnline" = true
    and u."profile" = 'user'
    and u."tenantId" = :tenantId
    and uq."queueId" = :queueId
    order by random() limit 1
  `;

  if (method === "B") {
    query = `
      select id from (
        select u.id, u."name", coalesce(count(t.id), 0) qtd_atendimentos  from "Users" u
        left join "UsersQueues" uq on (u.id = uq."userId")
        left join "Tickets" t on (t."userId" = u.id)
        where u."isOnline" = true
        and t.status not in ('closed', 'close')
        and u."profile" = 'user'
        and u."tenantId" = :tenantId
        and uq."queueId" = :queueId
        group by u.id, u."name"
        order by 3 limit 1
      ) a
    `;
  }

  const user: any = await User.sequelize?.query(query, {
    replacements: {
      tenantId,
      queueId
    },
    type: QueryTypes.SELECT
  });

  if (user.length) {
    const userId = user[0].id;
    await ticket.update({
      userId
    });

    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "userDefine",
      userId
    });
  }
};

export default DefinedUserBotService;
