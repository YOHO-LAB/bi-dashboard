const Service = require('../framework/service');
const _ = require('lodash');
const sequelize = require('sequelize');
const {BiProjectViews, BiProjectViewRoles, BiProjectViewsWorksheet, BiProjectWorksheets} = require('../db');

class ViewService extends Service {
  constructor() {
    super(BiProjectViewRoles);
  }
  async saveViewRoles(params) {
    await BiProjectViewRoles.destroy({
      where: {view_id: params[0].view_id}
    });

    return await BiProjectViewRoles.bulkCreate(params);
  }
  async getViewAndRoles(id) {
    return await BiProjectViews.findOne({
      include: [{
        model: BiProjectViewRoles,
        as: 'Roles'
      }],
      where: {id}
    });
  }
  async getViewWorksheets(viewId) {
    return await BiProjectViewsWorksheet.findAll({
      include: [{
        model: BiProjectWorksheets,
        as: 'Worksheet',
        require: true
      }],
      where: {
        view_id: viewId,
      },
      order: [['view_order', 'DESC']]
    });
  }
  deleteView(viewId) {
    const mainWhere = {
      where: {
        id: viewId
      }
    };
    const belongWhere = {
      where: {
        view_id: viewId
      }
    };

    return Promise.all([
      BiProjectViews.destroy(mainWhere),
      BiProjectViewsWorksheet.destroy(belongWhere),
      BiProjectViewRoles.destroy(belongWhere)
    ]);
  }
  async checkViewRole(...viewIds) {
    const views = await BiProjectViews.findAll({
      include: [{
        model: BiProjectViewRoles,
        as: 'Roles',
        require: true,
      }],
      where: sequelize.literal(`
        view_id in (${_.join(viewIds, ',')})
        and
          (
            Roles.role_id = ${this.$user.roleId}
            or
            BiProjectViews.create_user = ${this.$user.userId}
          )
      `)
    });

    const authViews = _.map(views, v => v.id);
    const unAuthViews = _.difference(viewIds, authViews);

    return [authViews, unAuthViews];
  }
}

module.exports = ViewService;
