import { Request, Response } from "express";
import AppError from "../errors/AppError";

export const ReceivedRequest360 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // const message = {
    //   token: req.params.token,
    //   messages: req.body
    // };
    // await req.app.rabbit.publishInQueue("waba360", JSON.stringify(message));
  } catch (error) {
    throw new AppError(error.message);
  }
  // Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};

export const CheckServiceMessenger = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const challenge = req.query["hub.challenge"];
  console.log("WEBHOOK_VERIFIED");
  return res.status(200).send(challenge);
};

export const ReceivedRequestMessenger = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // const message = {
    //   token: req.params.token,
    //   messages: req.body
    // };
    // await req.app.rabbit.publishInQueue("messenger", JSON.stringify(message));
  } catch (error) {
    throw new AppError(error.message);
  }
  // Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};
