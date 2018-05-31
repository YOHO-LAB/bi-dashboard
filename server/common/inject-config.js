const services = require('../services');

module.exports = [
  {alias: 'userService', bind: services.UserService},
  {alias: 'roleService', bind: services.RoleService},
  {alias: 'viewService', bind: services.ViewService},
  {alias: 'databaseService', bind: services.DatabaseService},
  {alias: 'sourceService', bind: services.SourceService},
  {alias: 'projectService', bind: services.ProjectService},
  {alias: 'worksheetService', bind: services.WorksheetService},
  {alias: 'databaseFilterService', bind: services.DatabaseFilterService},
  {alias: 'statementService', bind: services.StatementService}
];
