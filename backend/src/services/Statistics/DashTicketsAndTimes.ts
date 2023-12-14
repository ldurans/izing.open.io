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
    --dt_referencia,
    sum(qtd_total_atendimentos) qtd_total_atendimentos,
    sum(qtd_demanda_ativa) qtd_demanda_ativa,
    sum(qtd_demanda_receptiva) qtd_demanda_receptiva,
    coalesce(concat(ROUND(AVG(tma)::decimal,0), 0), 'minutes')::interval TMA,
    coalesce(concat(ROUND(AVG(tme)::decimal,0), 0), 'minutes')::interval TME,
    (select count(distinct(c."id"))
      from "Contacts" c
      INNER JOIN "Tickets" tc ON tc."contactId" = c."id"
      INNER JOIN "LogTickets" ltc ON ltc."ticketId" = tc."id"
      where
        c."tenantId" = :tenantId
        and ltc."userId" = :userId
        and date_trunc('day', c."createdAt") between :startDate and :endDate
    ) new_contacts
    --ROUND(AVG(tma)::decimal,0) TMA,
    --ROUND(AVG(tme)::decimal,0) TME
  from (
    select
      date_trunc('month', t."createdAt") dt_referencia,
      1 qtd_total_atendimentos,
      case when t."isActiveDemand" is true then 1 else 0 end qtd_demanda_ativa,
      case when t."isActiveDemand" is not true then 1 else 0 end qtd_demanda_receptiva,
      t."createdAt",
      to_timestamp(t."closedAt"/1000) closedAt,
      to_timestamp(t."startedAttendanceAt"/1000) startedAttendanceAt,
      extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60 tma,
      extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60 tme,
      t."tenantId"
    from "Tickets" t
    INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
    where
      t."tenantId" = :tenantId
      and date_trunc('day', t."createdAt") between :startDate and :endDate
      and lt."userId" = :userId
      and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  ) a
    --group by dt_referencia
      order by 1 Desc
`;

const queryAdmin = `
  select
    --dt_referencia,
    sum(qtd_total_atendimentos) qtd_total_atendimentos,
    sum(qtd_demanda_ativa) qtd_demanda_ativa,
    sum(qtd_demanda_receptiva) qtd_demanda_receptiva,
    coalesce(concat(ROUND(AVG(tma)::decimal,0), 0), 'minutes')::interval TMA,
    coalesce(concat(ROUND(AVG(tme)::decimal,0), 0), 'minutes')::interval TME,
    (select count(1)
      from "Contacts" c
      where
        c."tenantId" = :tenantId
        and date_trunc('day', c."createdAt") between :startDate and :endDate
    ) new_contacts
    --ROUND(AVG(tma)::decimal,0) TMA,
    --ROUND(AVG(tme)::decimal,0) TME
  from (
    select
      date_trunc('month', t."createdAt") dt_referencia,
      1 qtd_total_atendimentos,
      case when t."isActiveDemand" is true then 1 else 0 end qtd_demanda_ativa,
      case when t."isActiveDemand" is not true then 1 else 0 end qtd_demanda_receptiva,
      t."createdAt",
      to_timestamp(t."closedAt"/1000) closedAt,
      to_timestamp(t."startedAttendanceAt"/1000) startedAttendanceAt,
      extract(epoch from AGE(to_timestamp(t."closedAt"/1000), t."createdAt")::interval)/60 tma,
      extract(epoch from AGE(to_timestamp(t."startedAttendanceAt"/1000), t."createdAt"::timestamp)::interval)/60 tme,
      t."tenantId"
    from "Tickets" t
    INNER JOIN "LogTickets" lt ON lt."ticketId" = t."id"
    where
      t."tenantId" = :tenantId
      and date_trunc('day', t."createdAt") between :startDate and :endDate
      and (lt."type" LIKE 'open' OR lt."type" LIKE 'receivedTransfer')
  ) a
    --group by dt_referencia
      order by 1 Desc
`;

const DashTicketsAndTimes = async ({
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

export default DashTicketsAndTimes;
