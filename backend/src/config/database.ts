require("../bootstrap");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
    // freezeTableName: true
  },
  // pool: {
  //   max: 100,
  //   min: 5
  // },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: "UTC",
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  database: process.env.POSTGRES_DB || "wchats",
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "marina@0509",
  logging: false
};
