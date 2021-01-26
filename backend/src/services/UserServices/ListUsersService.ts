import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
// import UsersQueues from "../../models/UsersQueues";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  tenantId: string | number;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ListUsersService = async ({
  searchParam = "",
  pageNumber = "1",
  tenantId
}: Request): Promise<Response> => {
  const whereCondition = {
    tenantId,
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ]
  };
  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    include: [{ model: Queue, attributes: ["id", "queue"] }],
    attributes: ["name", "id", "email", "profile"],
    limit,
    offset,
    distinct: true,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore
  };
};

export default ListUsersService;
