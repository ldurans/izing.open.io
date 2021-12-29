import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
import Tenant from "../../models/Tenant";
// import UsersQueues from "../../models/UsersQueues";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const AdminListUsersService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("User.name")),
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
    include: [
      { model: Queue, attributes: ["id", "queue"] },
      { model: Tenant, attributes: ["id", "name"] }
    ],
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

export default AdminListUsersService;
