/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClient } from "redis";

const redisClient = new RedisClient({
  host: process.env.IO_REDIS_SERVER,
  port: Number(process.env.IO_REDIS_PORT),
  db: process.env.IO_REDIS_DB_SESSION
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getValue = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, value) => {
      if (err) return reject(err);
      let data: any;
      if (value) {
        try {
          data = JSON.parse(value || "");
        } catch (error) {
          data = String(value);
        }
      } else {
        data = value;
      }
      return resolve(data);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const setValue = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    let stringfy: any;
    if (typeof value === "object") {
      stringfy = JSON.stringify(value);
    } else {
      stringfy = String(value);
    }
    redisClient.set(key, stringfy, err => {
      if (err) return reject(err);
      return resolve(stringfy);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const removeValue = (key: string) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, err => {
      if (err) return reject(err);
      return resolve(true);
    });
  });
};
