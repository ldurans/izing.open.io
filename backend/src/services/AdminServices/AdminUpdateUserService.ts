import * as Yup from "yup";
import AppError from "../../errors/AppError";
import User from "../../models/User";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
}

interface Request {
  userData: UserData;
  userId: string | number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
  tenantId: string | number;
}

const AdminUpdateUserService = async ({
  userData,
  userId
}: Request): Promise<Response | undefined> => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: ["name", "id", "tenantId", "email", "profile"]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, name } = userData;

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err?.message);
  }

  await user.update({
    email,
    password,
    profile,
    name
  });

  await user.reload({
    attributes: ["id", "name", "email", "profile", "tenantId"]
  });

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    tenantId: user.tenantId
  };

  return serializedUser;
};

export default AdminUpdateUserService;
