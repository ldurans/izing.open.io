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
    select
    distinct(email),
    name,
    count(*) FILTER (where t.status = 'open') OVER (PARTITION by email ) as qtd_em_atendimento,
    count(*) FILTER (where t.status = 'pending') OVER (PARTITION by email) as qtd_pendentes,
    count(*) FILTER (where t.status = 'closed') OVER (PARTITION by email ) as qtd_resolvidos,
    count(*) OVER (PARTITION by email) as qtd_por_usuario,
    --ROUND(MIN(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0) menor_tma,
    --ROUND(MAX(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0) maior_tma,
    concat(coalesce(ROUND(AVG(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0), 0), 'minutes')::interval tma,
    --ROUND(MIN(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0) menor_tme,
    --ROUND(MAX(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0) maior_tme,
    concat(coalesce(ROUND(AVG(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0), 0), 'minutes')::interval tme
    from "Tickets" t
    left join "Users" u on t."userId" = "u"."id"
    left join "Queues" q on q.id  = t."queueId"
    where t."tenantId" = :tenantId  AND t."userId" = :userId
    and date_trunc('day', t."createdAt") between :startDate and :endDate
    order by 6 Desc
`;

const queryAdmin = `
    select
    distinct(email),
    name,
    count(*) FILTER (where t.status = 'open') OVER (PARTITION by email ) as qtd_em_atendimento,
    count(*) FILTER (where t.status = 'pending') OVER (PARTITION by email) as qtd_pendentes,
    count(*) FILTER (where t.status = 'closed') OVER (PARTITION by email ) as qtd_resolvidos,
    count(*) OVER (PARTITION by email) as qtd_por_usuario,
    --ROUND(MIN(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0) menor_tma,
    --ROUND(MAX(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0) maior_tma,
    concat(coalesce(ROUND(AVG(extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60) OVER (PARTITION by email)::decimal, 0), 0), 'minutes')::interval tma,
    --ROUND(MIN(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0) menor_tme,
    --ROUND(MAX(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0) maior_tme,
    concat(coalesce(ROUND(AVG(extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60) OVER (PARTITION by email)::decimal, 0), 0), 'minutes')::interval tme
    from "Tickets" t
    left join "Users" u on t."userId" = "u"."id"
    left join "Queues" q on q.id  = t."queueId"
    where t."tenantId" = :tenantId
    and date_trunc('day', t."createdAt") between :startDate and :endDate
    order by 6 Desc
`;

const DashTicketsPerUsersDetail = async ({
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
    }
  );
  return data;
};

export default DashTicketsPerUsersDetail;
