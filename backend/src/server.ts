import __init from "./app";
import { logger } from "./utils/logger";

__init().then((app: any) => {
  app.start();
  logger.info("Started system!!");
});
