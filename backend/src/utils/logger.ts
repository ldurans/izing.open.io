import pino from "pino";

const configPino = {
  dev: {
    enabled: true,
    level: "info"
  },
  prod: {
    enabled: true,
    level: "info",
    prettyPrint: {
      ignore: "pid,hostname"
    }
  }
};

let env = "prod";
if (process.env?.NODE_ENV) {
  env = process.env.NODE_ENV;
}

const logger = pino(env === "prod" ? configPino.prod : configPino.dev);

export { logger };
