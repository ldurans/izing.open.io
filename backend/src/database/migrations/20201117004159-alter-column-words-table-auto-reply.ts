import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("AutoReply", "words", {
        type: `${DataTypes.ARRAY(
          DataTypes.STRING
        )} USING CAST("words" as ${DataTypes.ARRAY(DataTypes.STRING)})`
      })
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("AutoReply", "words", {
        type: DataTypes.STRING,
        allowNull: false
      })
    ]);
  }
};
