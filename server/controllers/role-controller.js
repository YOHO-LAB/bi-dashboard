const _ = require('lodash');
const Controller = require('../framework/controller');
const {CacheUtil} = require('../utils');

class RoleController extends Controller {
  static route() {
    return [
      { path: '/fetch-roles-common', action: 'FetchRoles' },
      { path: '/fetch-roles', action: 'FetchRoles', purview: '0302' },
      { path: '/fetch-role', action: 'FetchRole', purview: '0302' },
      { path: '/save-data', method: 'post', action: 'SaveRole', purview: '030201' },
      { path: '/delete-data', method: 'post', action: 'DeleteData', purview: '030203' },
      { path: '/fetch-role-purviews', action: 'FetchRolePurviews', purview: '0302' },
      { path: '/save-role-purviews', method: 'post', action: 'SaveRolePurview', purview: '030201' },
    ];
  }
  constructor(roleService, databaseFilterService) {
    super();
    this.roleService = roleService;
    this.databaseFilterService = databaseFilterService;
  }
  async FetchRoles(req, res) {
    const roles = await this.roleService.gets();

    return res.json({
      code: 200,
      data: _.map(roles, role => {
        return {
          id: role.id,
          roleName: role.role_name,
          shopsId: role.shops_id
        };
      })
    });
  }
  async FetchRole(req, res) {
    const {id} = req.query;
    const role = await this.roleService.getRoleFiltersData(id);

    return res.json({
      code: 200,
      data: {
        id: role.id,
        roleName: role.role_name,
        filters: _.map(role.DatabaseFilters, f => {
          return {
            id: f.id,
            filterName: f.filter_name
          };
        })
      }
    });
  }
  async SaveRole(req, res) {
    let {id, roleName, filters = []} = req.body;

    if (!roleName) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    let result;
    const databaseFilters = await this.databaseFilterService.getDatbaseFiltersByIds(filters);

    if (id) {
      const role = await this.roleService.getRoleFiltersData(id);

      if (!role) {
        return res.json({
          code: 400,
          message: '未找到对应的角色'
        });
      }
      role.role_name = roleName;
      role.setDatabaseFilters(databaseFilters);
      result = await this.roleService.save(role);

    } else {
      const role = {
        role_name: roleName,
      };

      result = await this.roleService.createRoleAndFilter(role);
      result.setDatabaseFilters(databaseFilters);
    }
    if (result) {
      return res.json({
        code: 200
      });
    }
    return res.json({
      code: 400,
      message: '保存失败'
    });
  }
  async DeleteData(req, res) {
    const {id} = req.body;

    if (!id) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    if (id === 1) {
      return res.json({
        code: 400,
        message: '超级管理员无法删除'
      });
    }
    const role = await this.roleService.get(id);

    if (!role) {
      return res.json({
        code: 400,
        message: '未找到对应的角色'
      });
    }
    const result = await this.roleService.deleteRole(id);

    if (result) {
      return res.json({
        code: 200
      });
    }
    return res.json({
      code: 400,
      message: '删除失败'
    });
  }
  async FetchRolePurviews(req, res) {
    const {roleId} = req.query;

    if (!roleId) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const purview = await this.roleService.getRolePurviewsData(roleId);

    if (!purview) {
      return res.json({
        code: 400,
        message: '未找到对应的角色'
      });
    }
    return res.json({
      code: 200,
      data: purview
    });
  }
  async SaveRolePurview(req, res) {
    const {roleId, purviews} = req.body;

    if (!roleId || !purviews) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }
    const result = await this.roleService.saveRolePurview(roleId, purviews);

    if (result) {
      CacheUtil.remove(`purview_${roleId}`);
      return res.json({
        code: 200
      });
    }
    return res.json({
      code: 400,
      message: '保存失败'
    });
  }
}

module.exports = RoleController;
