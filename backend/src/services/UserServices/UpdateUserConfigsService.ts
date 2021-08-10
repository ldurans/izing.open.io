// import * as Yup from "yup";

import AppError from "../../errors/AppError";
import User from "../../models/User";

interface UserData {
  filtrosAtendimento?: any;
  isDark?: boolean;
}

interface Request {
  userConfigs: UserData;
  userId: string | number;
  tenantId: string | number;
}

const UpdateUserConfigsService = async ({
  userConfigs,
  userId,
  tenantId
}: Request): Promise<void> => {
  const user = await User.findOne({
    where: { id: userId, tenantId },
    attributes: ["name", "id", "email", "profile", "configs"]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await user.update({
    configs: {
      ...user.configs,
      ...userConfigs
    }
  });
};

export default UpdateUserConfigsService;
