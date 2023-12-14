import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
  userId: string | number;
  userProfile: string;
}

const query = `
  select dt_ref, to_char(dt_ref, 'DD/MM/YYYY') dt_referencia , label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  --to_char(date_trunc('day', t."createdAt"), 'DD/MM/YYYY') ,
  t.channel as label,
  count(1) as qtd
  from "Tickets" t
  INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
  where t."tenantId" = :tenantId  AND lt."userId" = :userId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt"), t.channel
  ) a
  order by 1
`;

const queryAdmin = `
  select dt_ref, to_char(dt_ref, 'DD/MM/YYYY') dt_referencia , label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  date_trunc('day', t."createdAt") dt_ref,
  --to_char(date_trunc('day', t."createdAt"), 'DD/MM/YYYY') ,
  t.channel as label,
  count(1) as qtd
  from "Tickets" t
  INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
  where t."tenantId" = :tenantId
  and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by date_trunc('day', t."createdAt"), t.channel
  ) a
  order by 1
`;

const DashTicketsEvolutionChannels = async ({
  startDate,
  endDate,
  tenantId,
  userId,
  userProfile
}: Request): Promise<any[]> => {
  const data = await sequelize.query(
    userProfile == "admin" ? queryAdmin : query,
    {
      replacements: {
        tenantId,
        startDate,
        endDate,
        userId
      },
      type: QueryTypes.SELECT
      // logging: console.log
    }
  );
  return data;
};

export default DashTicketsEvolutionChannels;
