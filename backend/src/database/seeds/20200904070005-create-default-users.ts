import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
        INSERT INTO public."Users" ("name",email,"passwordHash","createdAt","updatedAt",profile,"tokenVersion","tenantId","lastLogin","lastLogout","isOnline",configs,"lastOnline",status) VALUES
	      ('Administrador','admin@izing.io','$2a$08$/wEAiCcLkfGcnzxCQprgYeFryP7MCOIbjcpRlWTPY/EQ/ON.gI0qS','2020-11-07 17:28:29.832','2022-11-04 17:14:32.711','admin',0,1,'2022-11-03 01:35:12.607','2022-08-04 00:04:21.060',true,'{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}','2022-11-04 17:14:32.711','offline');
      `
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
