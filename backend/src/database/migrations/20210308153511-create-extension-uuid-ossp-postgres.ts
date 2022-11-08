import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(
        "select gen_random_uuid()"
        // 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
      )
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(
        "select gen_random_uuid()"
        // 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
      )
    ]);
  }
};
