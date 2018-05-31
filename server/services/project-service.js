const _ = require('lodash');
const {Op} = require('sequelize');
const Service = require('../framework/service');
const {BiProjects, BiProjectSources, BiProjectViews, BiProjectWorksheets} = require('../db');

class ProjectService extends Service {
  constructor(sourceService, viewService, worksheetService) {
    super(BiProjects);
    this.sourceService = sourceService;
    this.viewService = viewService;
    this.worksheetService = worksheetService;
  }
  deleteProject(projectId) {
    return Promise.all([
      BiProjectWorksheets.findAll({
        where: {
          project_id: projectId
        }
      }),
      BiProjectViews.findAll({
        where: {
          project_id: projectId
        }
      }),
      BiProjectSources.findAll({
        where: {
          project_id: projectId
        }
      })
    ]).then(resultAll => {
      const deleteWorksheetsPromises = _.map(resultAll[0], worksheet => {
        return this.worksheetService.deleteWorksheet(worksheet.id);
      });
      const deleteViewPromises = _.map(resultAll[0], view => {
        return this.viewService.deleteView(view.id);
      });
      const deleteSourcePromises = _.map(resultAll[0], source => {
        return this.sourceService.deleteSource(source.id);
      });

      const deletePromises = [
        BiProjects.destroy({
          where: {
            id: projectId
          }
        })
      ].concat(deleteWorksheetsPromises, deleteViewPromises, deleteSourcePromises);


      return Promise.all(deletePromises);
    });
  }
  async checkProjectRole(...projectIds) {
    const projects = await BiProjects.findAll({
      where: {
        id: projectIds,
        [Op.or]: [{
          create_role: this.$user.roleId,
          is_public: 1
        }, {
          create_user: this.$user.userId,
          is_public: 0
        }]
      }
    });

    const authViews = _.map(projects, v => v.id);
    const unAuthViews = _.difference(projectIds, authViews);

    return [authViews, unAuthViews];
  }
}

module.exports = ProjectService;
