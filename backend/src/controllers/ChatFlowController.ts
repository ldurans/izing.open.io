// import * as Yup from "yup";
import { Request, Response } from "express";

import CreateChatFlowService from "../services/ChatFlowServices/CreateChatFlowService";
import ListChatFlowService from "../services/ChatFlowServices/ListChatFlowService";
import AppError from "../errors/AppError";
import UpdateChatFlowService from "../services/ChatFlowServices/UpdateChatFlowService";
import DeleteChatFlowService from "../services/ChatFlowServices/DeleteChatFlowService";
// import UpdateAutoReplyService from "../services/AutoReplyServices/UpdateAutoReplyService";
// import DeleteAutoReplyService from "../services/AutoReplyServices/DeleteAutoReplyService";

interface Line {
  connector: string;
  from: string;
  paintStyle: string | any;
  to: string;
}
interface Configuration {
  maxRetryBotMessage: {
    destiny: string;
    number: number;
    type: number;
  };
  notOptionsSelectMessage: {
    message: string;
    stepReturn: string;
  };
  notResponseMessage: {
    destiny: string;
    time: number;
    type: number;
  };
}
interface NodeList {
  ico?: string;
  id: string;
  left: string;
  name: string;
  status: string;
  style?: string | any;
  top: string;
  type?: string;
  viewOnly?: boolean;
  configurations?: Configuration;
  actions?: [];
  conditions?: [];
  interactions?: [];
}

interface Flow {
  name: string;
  lineList: Line[];
  nodeList: NodeList[];
}

interface ChatFlowData {
  flow: Flow;
  name: string;
  userId: number;
  isActive: boolean;
  celularTeste?: string;
  tenantId: number | string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newFlow: ChatFlowData = {
    flow: { ...req.body },
    name: req.body.name,
    isActive: true,
    userId: +req.user.id,
    tenantId
  };

  // const schema = Yup.object().shape({
  //   name: Yup.string().required(),
  //   action: Yup.number().required(),
  //   tenantId: Yup.number().required(),
  //   userId: Yup.number().required()
  // });

  // try {
  //   await schema.validate(newAutoReply);
  // } catch (error) {
  //   throw new AppError(error.message);
  // }

  const chatFlow = await CreateChatFlowService(newFlow);

  return res.status(200).json(chatFlow);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const chatFlow = await ListChatFlowService({ tenantId });
  return res.status(200).json(chatFlow);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;

  const newFlow: ChatFlowData = {
    flow: { ...req.body },
    name: req.body.name,
    isActive: req.body.isReactive,
    userId: +req.user.id,
    tenantId
  };

  // const schema = Yup.object().shape({
  //   name: Yup.string().required(),
  //   action: Yup.number().required(),
  //   userId: Yup.number().required()
  // });

  // try {
  //   await schema.validate(autoReplyData);
  // } catch (error) {
  //   throw new AppError(error.message);
  // }

  const { chatFlowId } = req.params;
  const chatFlow = await UpdateChatFlowService({
    chatFlowData: newFlow,
    chatFlowId,
    tenantId
  });

  return res.status(200).json(chatFlow);
};
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chatFlowId } = req.params;
  const { tenantId } = req.user;

  await DeleteChatFlowService({ id: chatFlowId, tenantId });

  return res.status(200).json({ message: "Flow deleted" });
};

// export const remove = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   if (req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }
//   const { tenantId } = req.user;
//   const { autoReplyId } = req.params;

//   await DeleteAutoReplyService({ id: autoReplyId, tenantId });
//   return res.status(200).json({ message: "Auto reply deleted" });
// };
