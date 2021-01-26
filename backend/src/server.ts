import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import { logger } from "./utils/logger";

const PORTA = process.env.PORT || "3000";

const server = app.listen(PORTA, () => {
  logger.info(`Server started on port: ${PORTA}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
