const Service = require('../framework/service');
const {BiRoles, BiPurviews, BiRolePurviews, BiDatabaseFilter} = require('../db');
const _ = require('lodash');

class RoleService extends Service {
  constructor() {
    super(BiRoles);
  }
  async getRolePurviews(roleId) {
    return await BiRoles.find({
      include: [{
        model: BiPurviews,
        as: 'Purviews'
      }],
      where: {
        id: roleId
      }
    });
  }
  async getRolePurviewsData(roleId) {
    const allPurview = await BiPurviews.findAll();
    const role = await BiRoles.find({
      include: [{
        model: BiPurviews,
        as: 'Purviews'
      }],
      where: {
        id: roleId
      }
    });

    if (!role) {
      return void 0;
    }

    const purviews = _.map(allPurview, p => {
      if (_.some(role.Purviews, rp => rp.id === p.id)) {
        p.checked = true;
      }
      return p;
    });

    return this._getPurviewObject(purviews, '');
  }
  _getPurviewObject(source, roleId) {
    const purview = [];
    const findPurviews = _.filter(source, p => p.purview_parent === roleId);

    _.each(findPurviews, p => {
      const pur = {
        purviewId: p.id,
        expand: true,
        title: p.purview_name,
        checked: p.checked
      };
      const childPurviews = _.filter(source, cp => cp.purview_parent === p.id);

      if (childPurviews.length) {
        pur.children = this._getPurviewObject(source, p.id);
      }
      purview.push(pur);
    });
    return purview;
  }
  async saveRolePurview(roleId, purviews) {
    await BiRolePurviews.destroy({
      where: {role_id: roleId}
    });
    return await BiRolePurviews.bulkCreate(_.map(purviews, pid => {
      return {
        role_id: roleId,
        purview_id: pid
      };
    }));
  }
  async deleteRole(roleId) {
    const mainWhere = {
      where: {
        id: roleId
      }
    };
    const belongWhere = {
      where: {
        role_id: roleId
      }
    };

    return Promise.all([
      BiRoles.destroy(mainWhere),
      BiRolePurviews.destroy(belongWhere)
    ]);
  }
  async getRoleFiltersData(roleId) {
    return BiRoles.find({
      where: {
        id: roleId
      },
      include: [{
        model: BiDatabaseFilter,
        as: 'DatabaseFilters'
      }]
    });
  }
  async createRoleAndFilter(role) {
    return BiRoles.create(role, {
      include: [{
        model: BiDatabaseFilter,
        as: 'DatabaseFilters'
      }]
    });
  }
}

module.exports = RoleService;
