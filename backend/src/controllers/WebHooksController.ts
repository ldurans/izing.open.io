import { Request, Response } from "express";
import AppError from "../errors/AppError";

export const ReceivedRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("ReceivedRequest", req);
    console.log("ReceivedRequest 2");
  } catch (error) {
    throw new AppError(error.message);
  }
  // Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};
