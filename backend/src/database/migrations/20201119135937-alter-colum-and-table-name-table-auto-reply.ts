import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("AutoReply", "reply", "name"),
      queryInterface.removeColumn("AutoReply", "words")
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("AutoReply", "name", "reply"),
      queryInterface.addColumn("AutoReply", "words", {
        type: DataTypes.ARRAY(DataTypes.STRING)
      })
    ]);
  }
};
