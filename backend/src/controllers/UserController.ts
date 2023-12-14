import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import UpdateUserConfigsService from "../services/UserServices/UpdateUserConfigsService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    tenantId
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { email, password, name, profile } = req.body;
  const { users } = await ListUsersService({ tenantId });

  if (users.length >= Number(process.env.USER_LIMIT)) {
          throw new AppError("ERR_USER_LIMIT_USER_CREATION", 400);
  }

  else if (
    
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    tenantId
  });

  const io = getIO();
  io.emit(`${tenantId}:user`, {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { tenantId } = req.user;

  const user = await ShowUserService(userId, tenantId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const { userId } = req.params;
  const userData = req.body;
  const { tenantId } = req.user;

  const user = await UpdateUserService({ userData, userId, tenantId });

  const io = getIO();
  io.emit(`${tenantId}:user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const updateConfigs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const { userId } = req.params;
  const userConfigs = req.body;
  const { tenantId } = req.user;

  await UpdateUserConfigsService({ userConfigs, userId, tenantId });

  return res.status(200).json();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { tenantId } = req.user;
  const userIdRequest = req.user.id;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId, tenantId, userIdRequest);

  const io = getIO();
  io.emit(`${tenantId}:user`, {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
