import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Includeable, Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import ContactWallet from "../../models/ContactWallet";

const dddsPorEstado = [
  { estado: "AC", ddds: ["68"] },
  { estado: "AL", ddds: ["82"] },
  { estado: "AM", ddds: ["92", "97"] },
  { estado: "AP", ddds: ["96"] },
  { estado: "BA", ddds: ["71", "73", "74", "75", "77"] },
  { estado: "CE", ddds: ["85", "88"] },
  { estado: "DF", ddds: ["61"] },
  { estado: "ES", ddds: ["27", "28"] },
  { estado: "GO", ddds: ["62", "64"] },
  { estado: "MA", ddds: ["98", "99"] },
  { estado: "MG", ddds: ["31", "32", "33", "34", "35", "37", "38"] },
  { estado: "MS", ddds: ["67"] },
  { estado: "MT", ddds: ["65", "66"] },
  { estado: "PA", ddds: ["91", "93", "94"] },
  { estado: "PB", ddds: ["83"] },
  { estado: "PE", ddds: ["81", "87"] },
  { estado: "PI", ddds: ["86", "89"] },
  { estado: "PR", ddds: ["41", "42", "43", "44", "45", "46"] },
  { estado: "RJ", ddds: ["21", "22", "24"] },
  { estado: "RN", ddds: ["84"] },
  { estado: "RO", ddds: ["69"] },
  { estado: "RR", ddds: ["95"] },
  { estado: "RS", ddds: ["51", "53", "54", "55"] },
  { estado: "SC", ddds: ["47", "48", "49"] },
  { estado: "SE", ddds: ["79"] },
  {
    estado: "SP",
    ddds: ["11", "12", "13", "14", "15", "16", "17", "18", "19"]
  },
  { estado: "TO", ddds: ["63"] }
];

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
  tags?: number[] | string[];
  wallets?: number[] | string[];
  ddds?: number[] | string[];
  userId: number;
  profile: string;
  searchParam?: string;
}

interface Response {
  contacts: Contact[];
}

const ListContactsService = async ({
  startDate,
  endDate,
  tenantId,
  tags,
  wallets,
  ddds,
  userId,
  profile,
  searchParam
}: Request): Promise<Response> => {
  let includeCondition: Includeable[] = [];
  let where: any = {
    tenantId,
    isGroup: false
  };

  if (searchParam) {
    where = {
      ...where,
      [Op.or]: [
        {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
            "LIKE",
            `%${searchParam.toLowerCase().trim()}%`
          )
        },
        { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
      ]
    };
  }

  if (startDate && endDate) {
    where = {
      ...where,
      createdAt: {
        [Op.between]: [
          +startOfDay(parseISO(startDate)),
          +endOfDay(parseISO(endDate))
        ]
      }
    };
  }

  if (tags) {
    includeCondition = [
      {
        model: Tag,
        as: "tags",
        where: {
          id: {
            [Op.in]: tags
          }
        },
        required: true
      }
    ];
  }

  if (wallets) {
    includeCondition.push({
      model: ContactWallet,
      // as: "wallets",
      where: {
        walletId: wallets
      },
      required: true
    });
  } else if (profile !== "admin") {
    includeCondition.push({
      model: ContactWallet,
      // as: "wallet",
      where: {
        walletId: userId
      },
      required: true
    });
  }

  if (ddds) {
    let dddsFilter: string[] = [];
    // eslint-disable-next-line consistent-return
    ddds.forEach((el: any) => {
      if (el) {
        const d = dddsPorEstado.find((ddd: any) => ddd.estado === el)?.ddds;
        if (d) {
          dddsFilter = dddsFilter.concat(d);
        }
      }
    });
    where = {
      ...where,
      number: {
        [Op.or]: dddsFilter.map(ddd => ({ [Op.like]: `55${ddd}%` }))
      }
    };
  }

  const contacts = await Contact.findAll({
    where,
    attributes: ["id", "name", "number", "email"],
    include: includeCondition,
    order: [["name", "ASC"]]
  });

  return { contacts };
};

export default ListContactsService;
