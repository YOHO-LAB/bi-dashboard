const purview = {
  DATABASE: {
    purview_name: '数据连接管理',
    purview_code: '01',
    CREATE: {
      purview_name: '创建',
      purview_code: '0101',
    },
    EDIT: {
      purview_name: '更新',
      purview_code: '0102',
    },
    DELETE: {
      purview_name: '删除',
      purview_code: '0103',
    },
    VIEW: {
      purview_name: '查看',
      purview_code: '0104',
    },
  },
  PROJECT: {
    purview_name: '项目管理',
    purview_code: '02',
    CREATE: {
      purview_name: '创建',
      purview_code: '0201',
    },
    EDIT: {
      purview_name: '更新',
      purview_code: '0202',
    },
    DELETE: {
      purview_name: '删除',
      purview_code: '0203',
    },
    VIEW: {
      purview_name: '查看',
      purview_code: '0207',
    },
    WORKSHEET: {
      purview_name: '工作簿',
      purview_code: '0204',
      CREATE: {
        purview_name: '创建',
        purview_code: '020401',
      },
      EDIT: {
        purview_name: '更新',
        purview_code: '020402',
      },
      DELETE: {
        purview_name: '删除',
        purview_code: '020403',
      },
      VIEW: {
        purview_name: '查看',
        purview_code: '020404',
      },
    },
    VIEWS: {
      purview_name: '视图',
      purview_code: '0205',
      CREATE: {
        purview_name: '创建',
        purview_code: '020501',
      },
      EDIT: {
        purview_name: '更新',
        purview_code: '020502',
      },
      DELETE: {
        purview_name: '删除',
        purview_code: '020503',
      },
      PUBLISH: {
        purview_name: '发布',
        purview_code: '020504',
      },
      VIEW: {
        purview_name: '查看',
        purview_code: '020505',
      },
      PUBLISH_VIEW: {
        purview_name: '查看报表',
        purview_code: '020506',
      },
    },
    SOURCE: {
      purview_name: '数据源',
      purview_code: '0206',
      CREATE: {
        purview_name: '创建',
        purview_code: '020601',
      },
      EDIT: {
        purview_name: '更新',
        purview_code: '020602',
      },
      DELETE: {
        purview_name: '删除',
        purview_code: '020603',
      },
      VIEW: {
        purview_name: '查看',
        purview_code: '020604',
      },
    }
  },
  MANAGE: {
    purview_name: '系统管理',
    purview_code: '03',
    USER: {
      purview_name: '用户管理',
      purview_code: '0301',
      ENABLE: {
        purview_name: '禁用/启用',
        purview_code: '030101',
      },
      EDIT: {
        purview_name: '编辑',
        purview_code: '030102',
      },
      VIEW: {
        purview_name: '查看',
        purview_code: '030103',
      },
    },
    ROLE: {
      purview_name: '角色管理',
      purview_code: '0302',
      CREATE: {
        purview_name: '创建',
        purview_code: '030201',
      },
      EDIT: {
        purview_name: '更新',
        purview_code: '030202',
      },
      DELETE: {
        purview_name: '删除',
        purview_code: '030203',
      },
      VIEW: {
        purview_name: '查看',
        purview_code: '030204',
      },
    }
  }
};


module.exports = purview;
