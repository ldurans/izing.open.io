/* eslint-disable @typescript-eslint/no-explicit-any */
import FindUpdateTicketsInactiveChatBot from "../services/TicketServices/FindUpdateTicketsInactiveChatBot";
import { logger } from "../utils/logger";

export default {
  key: "VerifyTicketsChatBotInactives",
  options: {
    // attempts: 0,
    removeOnComplete: true,
    removeOnFail: false,
    jobId: "VerifyTicketsChatBotInactives",
    repeat: {
      every: 5 * 60 * 1000
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle() {
    try {
      logger.info("FindUpdateTicketsInactiveChatBot Initiated");
      await FindUpdateTicketsInactiveChatBot();
      logger.info("Finalized FindUpdateTicketsInactiveChatBot");
    } catch (error) {
      logger.error({ message: "Error send messages", error });
      throw new Error(error);
    }
  }
};
