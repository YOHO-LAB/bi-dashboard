'use strict';
const crypto = require('../../utils/crypto');

const purviews = [
  {
    id: '01',
    purview_name: '数据连接管理',
    purview_level: 1,
    purview_parent: ''
  },
  {
    id: '0101',
    purview_name: '创建',
    purview_level: 2,
    purview_parent: '01'
  },
  {
    id: '0102',
    purview_name: '更新',
    purview_level: 2,
    purview_parent: '01'
  },
  {
    id: '0103',
    purview_name: '删除',
    purview_level: 2,
    purview_parent: '01'
  },
  {
    id: '0104',
    purview_name: '查看',
    purview_level: 2,
    purview_parent: '01'
  },
  {
    id: '02',
    purview_name: '项目管理',
    purview_level: 1,
    purview_parent: ''
  },
  {
    id: '0201',
    purview_name: '创建',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '0202',
    purview_name: '更新',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '0203',
    purview_name: '删除',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '0207',
    purview_name: '查看',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '0204',
    purview_name: '工作簿',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '020401',
    purview_name: '创建',
    purview_level: 3,
    purview_parent: '0204'
  },
  {
    id: '020402',
    purview_name: '更新',
    purview_level: 3,
    purview_parent: '0204'
  },
  {
    id: '020403',
    purview_name: '删除',
    purview_level: 3,
    purview_parent: '0204'
  },
  {
    id: '020404',
    purview_name: '查看',
    purview_level: 3,
    purview_parent: '0204'
  },
  {
    id: '0205',
    purview_name: '视图',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '020501',
    purview_name: '创建',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '020502',
    purview_name: '更新',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '020503',
    purview_name: '删除',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '020504',
    purview_name: '发布',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '020505',
    purview_name: '查看',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '020506',
    purview_name: '查看报表',
    purview_level: 3,
    purview_parent: '0205'
  },
  {
    id: '0206',
    purview_name: '数据源',
    purview_level: 2,
    purview_parent: '02'
  },
  {
    id: '020601',
    purview_name: '创建',
    purview_level: 3,
    purview_parent: '0206'
  },
  {
    id: '020602',
    purview_name: '更新',
    purview_level: 3,
    purview_parent: '0206'
  },
  {
    id: '020603',
    purview_name: '删除',
    purview_level: 3,
    purview_parent: '0206'
  },
  {
    id: '020604',
    purview_name: '查看',
    purview_level: 3,
    purview_parent: '0206'
  },
  {
    id: '03',
    purview_name: '系统管理',
    purview_level: 1,
    purview_parent: ''
  },
  {
    id: '0301',
    purview_name: '用户管理',
    purview_level: 2,
    purview_parent: '03'
  },
  {
    id: '030101',
    purview_name: '禁用/启用',
    purview_level: 3,
    purview_parent: '0301'
  },
  {
    id: '030102',
    purview_name: '编辑',
    purview_level: 3,
    purview_parent: '0301'
  },
  {
    id: '030103',
    purview_name: '查看',
    purview_level: 3,
    purview_parent: '0301'
  },
  {
    id: '0302',
    purview_name: '角色管理',
    purview_level: 2,
    purview_parent: '03'
  },
  {
    id: '030201',
    purview_name: '创建',
    purview_level: 3,
    purview_parent: '0302'
  },
  {
    id: '030202',
    purview_name: '更新',
    purview_level: 3,
    purview_parent: '0302'
  },
  {
    id: '030203',
    purview_name: '删除',
    purview_level: 3,
    purview_parent: '0302'
  },
  {
    id: '030204',
    purview_name: '查看',
    purview_level: 3,
    purview_parent: '0302'
  }
];

module.exports = {
  up: (queryInterface) => {
    const purviewPromise = queryInterface.bulkInsert('bi_purviews', purviews.map(p => {
      return Object.assign(p, {
        created_at: new Date(),
        updated_at: new Date(),
      });
    }), {});
    const rolePromise = queryInterface.bulkInsert('bi_roles', [{
      id: 1,
      role_name: '超级管理员',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      id: 2,
      role_name: '访客',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    const rolePurviewPromise = queryInterface.bulkInsert('bi_role_purviews', [{
      role_id: 2,
      purview_id: '020506',
      created_at: new Date(),
      updated_at: new Date(),
    }].concat(purviews.map(p => {
      return {
        role_id: 1,
        purview_id: p.id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    })));
    const userPromise = queryInterface.bulkInsert('bi_users', [{
      role_id: 1,
      user_name: 'admin',
      user_pwd: crypto.md5('admin123'),
      real_name: '管理员',
      email: 'xxx@xx.com',
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    return Promise.all([purviewPromise, rolePromise, rolePurviewPromise, userPromise]);
  },

  down: () => {
    return Promise.resolve();
  }
};
