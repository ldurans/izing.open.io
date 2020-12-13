import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

const PORTA = process.env.PORT || "3000";

const server = app.listen(PORTA, () => {
  console.log(`Server started on port: ${PORTA}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
