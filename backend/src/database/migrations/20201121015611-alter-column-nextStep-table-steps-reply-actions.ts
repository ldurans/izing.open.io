import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("StepsReplyActions", "nextStep", "nextStepId")
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("StepsReplyActions", "nextStepId", "nextStep")
    ]);
  }
};
