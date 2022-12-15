import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(
        "update \"Whatsapps\" SET status = 'DISCONNECTED' WHERE status = 'DESTROYED';"
      )
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query("select gen_random_uuid()")
    ]);
  }
};
