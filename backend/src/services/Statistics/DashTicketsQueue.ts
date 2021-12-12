import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
  select label, qtd,  ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual from (
  select
  coalesce(q.queue, 'Não informado') as label,
  count(1) as qtd
  from "Tickets" t
  left join "Queues" q on (t."queueId" = q.id)
  where t."tenantId" = :tenantId
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by t."queueId", q.queue
  ) a
  order by 2 Desc
`;

const DashTicketsQueue = async ({
  startDate,
  endDate,
  tenantId
}: Request): Promise<any[]> => {
  const data = await sequelize.query(query, {
    replacements: {
      tenantId,
      startDate,
      endDate
    },
    type: QueryTypes.SELECT
    // logging: console.log
  });
  return data;
};

export default DashTicketsQueue;
