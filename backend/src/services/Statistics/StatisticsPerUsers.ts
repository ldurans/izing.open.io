import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
    select
    distinct(email),
    name,
    --, email,)
    count(*) FILTER (where t.status = 'open') OVER (PARTITION by email ) as qtd_em_atendimento,
    count(*) FILTER (where t.status = 'pending') OVER (PARTITION by email) as qtd_pendentes,
    count(*) FILTER (where t.status = 'closed') OVER (PARTITION by email ) as qtd_resolvidos,
    count(*) OVER (PARTITION by email) as qtd_por_usuario,
    min((DATE_PART('day',  to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000)) * 24 +
    DATE_PART('hour', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) * 60 +
    DATE_PART('minute', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) OVER (PARTITION by email) as menor_tempo_por_usuario,
    max((DATE_PART('day',  to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000)) * 24 +
    DATE_PART('hour', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) * 60 +
    DATE_PART('minute', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) OVER (PARTITION by email) as maior_tempo_por_usuario,
    avg((DATE_PART('day',  to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000)) * 24 +
    DATE_PART('hour', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) * 60 +
    DATE_PART('minute', to_timestamp(t."closedAt"/1000) - to_timestamp(t."startedAttendanceAt"/1000))) OVER (PARTITION by email)  as tempo_medio_por_usuario
    from "Tickets" t
    left join "Users" u on t."userId" = "u"."id"
    left join "Queues" q on q.id  = t."queueId"
    where t."tenantId" = :tenantId
    and date_trunc('day', t."createdAt") between :startDate and :endDate
    order by 6 Desc
`;

const StatisticsPerUser = async ({
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

export default StatisticsPerUser;
