import ApiMessage from "../../models/ApiMessage";

interface MessageData {
  id?: string;
  sessionId: number;
  messageId: string;
  body: string;
  ack: number;
  number: number;
  media?: string;
  timestamp: number;
  externalKey: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  messageWA: object;
  // eslint-disable-next-line @typescript-eslint/ban-types
  apiConfig: object;
  tenantId: number;
}

const UpsertMessageAPIService = async ({
  id,
  sessionId,
  messageId,
  body,
  ack,
  number,
  media,
  timestamp,
  externalKey,
  messageWA,
  apiConfig,
  tenantId
}: MessageData): Promise<ApiMessage> => {
  const message = await ApiMessage.upsert(
    {
      id,
      sessionId,
      messageId,
      body,
      ack,
      number,
      media,
      timestamp,
      externalKey,
      messageWA,
      apiConfig,
      tenantId
    },
    { returning: true }
  );

  if (!message) {
    // throw new AppError("ERR_CREATING_MESSAGE", 501);
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const apiMessage = await ApiMessage.findByPk(message[0].id);

  if (!apiMessage) {
    // throw new AppError("ERR_CREATING_MESSAGE", 501);
    throw new Error("ERR_CREATING_MESSAGE");
  }

  return apiMessage;
};

export default UpsertMessageAPIService;
