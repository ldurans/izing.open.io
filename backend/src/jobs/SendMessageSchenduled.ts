/* eslint-disable @typescript-eslint/no-explicit-any */
import SendMessagesSchenduleWbot from "../services/WbotServices/SendMessagesSchenduleWbot";
import { logger } from "../utils/logger";

export default {
  key: "SendMessageSchenduled",
  options: {
    // attempts: 0,
    removeOnComplete: false,
    removeOnFail: false,
    jobId: "SendMessageSchenduled",
    repeat: {
      every: 1 * 60 * 1000
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle() {
    try {
      logger.info("SendMessageSchenduled Initiated");
      await SendMessagesSchenduleWbot();
      logger.info("Finalized SendMessageSchenduled");
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      throw new Error(error);
    }
  }
};
