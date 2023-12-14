import "../database";
import { logger } from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unused-vars
export default async function database(app): Promise<void> {
  logger.info("database already in server!");
}
