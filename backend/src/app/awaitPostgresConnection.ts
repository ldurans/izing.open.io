import { exec } from "child_process";
import { promisify } from "util";
import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";

const execAsync = promisify(exec);

// eslint-disable-next-line
const dbConfig = require("../config/database");

// Função para aguardar a conexão com o PostgreSQL
const waitForPostgresConnection = async function () {
  const sequelize = new Sequelize(dbConfig);

  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await sequelize.authenticate();
      logger.info("Conexão com o PostgreSQL estabelecida com sucesso!");

      if (process.env.NODE_ENV === "production") {
        logger.info("Iniciando a execução das migrations...");
        // eslint-disable-next-line no-await-in-loop
        const { stdout, stderr } = await execAsync(
          "npm run copy-templates-files && npx sequelize db:migrate"
        );
        logger.info(`Saída do comando: ${stdout}`);
        if (stderr) {
          logger.error(`Erro ao executar o comando: ${stderr}`);
          throw new Error(`Erro ao executar o comando: ${stderr}`);
        }
        logger.info("Migrations executadas com sucesso!");
      }
      break;
    } catch (error) {
      logger.info(
        "Falha ao conectar ao PostgreSQL. Tentando novamente em 5 segundos..."
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

export default waitForPostgresConnection;
