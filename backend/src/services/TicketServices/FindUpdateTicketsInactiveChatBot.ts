/* eslint-disable eqeqeq */
import { QueryTypes } from "sequelize";

import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";

const FindUpdateTicketsInactiveChatBot = async (): Promise<void> => {
  const query = `
    select
    t.id,
    --t."contactId",
    --t."lastInteractionBot",
    --t.status,
    --config->'configurations',
    --concat(config->'configurations'->'notResponseMessage'->'time', ' MINUTES')::interval as time_action,
    config->'configurations'->'notResponseMessage'->'type' as type_action,
    config->'configurations'->'notResponseMessage'->'destiny' as destiny
    from "Tickets" t
    inner join "ChatFlow" cf on t."tenantId" = cf."tenantId" and cf.id = t."chatFlowId"
    inner join "Settings" s on s."tenantId" = cf."tenantId" and s."key" = 'botTicketActive'
    cross join lateral json_array_elements(cf.flow->'nodeList') as config
    where t."chatFlowId"::text = s.value
    and t.status = 'pending'
    and config->>'type' = 'configurations'
    and t."lastInteractionBot" < CURRENT_TIMESTAMP - concat(config->'configurations'->'notResponseMessage'->'time', ' MINUTES')::interval
    and (t."queueId" is null and t."userId" is null)
  `;

  const tickets: any = await Ticket.sequelize?.query(query, {
    type: QueryTypes.SELECT
  });
  Promise.all(
    tickets.map(async (item: any) => {
      // se não houve destino, retornar
      if (!item.destiny) return;
      const ticket = await Ticket.findByPk(item.id);
      if (ticket) {
        const values: any = {
          chatFlowId: null,
          stepChatFlow: null,
          botRetries: 0,
          lastInteractionBot: new Date()
        };
        // instance.type_action: 1 = fila | 2 = usuario
        if (item.type_action == 1) {
          values.queueId = item.destiny;
        }
        if (item.type_action == 2) {
          values.userId = item.destiny;
        }
        await ticket.update(values);
        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });
      }
    })
  );
};

export default FindUpdateTicketsInactiveChatBot;
