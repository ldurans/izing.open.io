/* eslint-disable @typescript-eslint/no-explicit-any */
// import { v4 as uuid } from "uuid";
import { getValue, setValue } from "../libs/redisClient";
import { getWbot } from "../libs/wbot";
import SendMessagesSystemWbot from "../services/WbotServices/SendMessagesSystemWbot";
import { logger } from "../utils/logger";

export default {
  key: "SendMessages",
  options: {
    attempts: 0,
    removeOnComplete: true,
    removeOnFail: true
    // repeat: {
    //   every: 5000
    // }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    const sending = await getValue(`sendingMessages_tenant_${data.tenantId}`);
    try {
      logger.info(`Sending Tenant Initiated: ${data.tenantId} => ${sending}`);
      if (sending) return;
      await setValue(`sendingMessages_tenant_${data.tenantId}`, true);
      const wbot = getWbot(data.sessionId);
      await SendMessagesSystemWbot(wbot, data.tenantId);
      await setValue(`sendingMessages_tenant_${data.tenantId}`, false);
      logger.info(`Finalized Sending Tenant: ${data.tenantId}`);
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      await setValue(`sendingMessages_tenant_${data.tenantId}`, false);
      throw new Error(error);
    }
  }
};
