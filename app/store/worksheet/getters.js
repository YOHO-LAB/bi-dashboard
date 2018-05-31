import {
  GETTER_VALUE_MENU,
  GETTER_COLUMN_MENU,
  GETTER_DIMENSITION_MENU,
  GETTER_FILTER_MENU,
  GETTER_MEASURE_MENU,
  GETTER_ROW_MENU,
  GETTER_CALC_MATH,
  GETTER_RESULT_TYPES,
} from './types';

export default {
  [GETTER_VALUE_MENU]() {
    return value => {
      const menus = [];

      if (value.type === 'M' && (!value.calc || value.calc.type !== 'GROUP')) {
        menus.push({
          title: '度量',
          single: true,
          menus: [{
            title: '总计',
            target: 'valueType',
            val: 'SUM',
            selected: value.options.valueType === 'SUM',
          }, {
            title: '平均值',
            target: 'valueType',
            val: 'AVG',
            selected: value.options.valueType === 'AVG',
          }, {
            title: '计数',
            target: 'valueType',
            val: 'COUNT',
            selected: value.options.valueType === 'COUNT',
          }, {
            title: '计数(DISTINCT)',
            target: 'valueType',
            val: 'DISTINCT',
            selected: value.options.valueType === 'DISTINCT',
          }, {
            title: '最小值',
            target: 'valueType',
            val: 'MIN',
            divided: true,
            selected: value.options.valueType === 'MIN',
          }, {
            title: '最大值',
            target: 'valueType',
            val: 'MAX',
            selected: value.options.valueType === 'MAX',
          }]
        });
      }
      if (value.type === 'M') {
        menus.push({
          title: '格式化',
          menus: [{
            title: '百分比',
            target: 'formatType',
            val: 'PERCENT',
            selected: value.options.formatType === 'PERCENT',
          }]
        });
      }
      menus.push({
        title: '移除',
        target: 'remove'
      });

      return {
        menus
      };
    };
  },
  [GETTER_COLUMN_MENU]() {
    return () => {
      const menus = [];

      menus.push({
        title: '移除',
        target: 'remove'
      });

      return {
        menus
      };
    };
  },
  [GETTER_ROW_MENU]() {
    return () => {
      const menus = [];

      menus.push({
        title: '移除',
        target: 'remove'
      });

      return {
        menus
      };
    };
  },
  [GETTER_DIMENSITION_MENU]() {
    return (value) => {
      const menus = [];

      if (value.calc) {
        menus.push({
          title: '编辑计算字段',
          target: 'edit-calc'
        });
      }

      menus.push({
        title: '重命名',
        target: 'rename'
      });
      if (value.parentCategory) {
        if (value.order > 0) {
          menus.push({
            title: '上移',
            val: 'up',
            target: 'change-order'
          });
        }
        if (value.order < value.parentCategory.count - 1) {
          menus.push({
            title: '下移',
            val: 'down',
            target: 'change-order'
          });
        }
      }

      if (value.calc) {
        menus.push({
          title: '移除',
          target: 'remove'
        });
      }

      return {
        menus
      };
    };
  },
  [GETTER_MEASURE_MENU]() {

    return (value) => {
      const menus = [];

      if (value.calc) {
        menus.push({
          title: '编辑计算字段',
          target: 'edit-calc'
        });
      }

      menus.push({
        title: '重命名',
        target: 'rename'
      });

      if (value.calc) {
        menus.push({
          title: '移除',
          target: 'remove'
        });
      }

      return {
        menus
      };
    };
  },
  [GETTER_FILTER_MENU]() {
    return value => {
      const menus = [];

      if (value.type === 'D') {
        menus.push({
          title: '筛选格式',
          single: 'true',
          menus: [{
            title: '时间筛选',
            target: 'filterType',
            val: 'DateLimit',
            selected: value.options.filterType === 'DateLimit',
          }]
        });
      } else if (value.type === 'M') {
        menus.push({
          title: '度量',
          single: true,
          menus: [{
            title: '总计',
            target: 'valueType',
            val: 'SUM',
            selected: value.options.valueType === 'SUM',
          }, {
            title: '平均值',
            target: 'valueType',
            val: 'AVG',
            selected: value.options.valueType === 'AVG',
          }, {
            title: '计数',
            target: 'valueType',
            val: 'COUNT',
            selected: value.options.valueType === 'COUNT',
          }, {
            title: '计数(DISTINCT)',
            target: 'valueType',
            val: 'DISTINCT',
            selected: value.options.valueType === 'DISTINCT',
          }, {
            title: '最小值',
            target: 'valueType',
            val: 'MIN',
            divided: true,
            selected: value.options.valueType === 'MIN',
          }, {
            title: '最大值',
            target: 'valueType',
            val: 'MAX',
            selected: value.options.valueType === 'MAX',
          }]
        });
      }
      menus.push({
        title: '移除',
        target: 'remove'
      });

      return {
        menus
      };
    };
  },
  [GETTER_CALC_MATH]() {
    return [{
      title: 'SUM',
      label: '总计'
    }, {
      title: 'AVG',
      label: '平均'
    }, {
      title: 'COUNT',
      label: '计数'
    }, {
      title: 'DISTINCT',
      label: 'DISTINCT'
    }, {
      title: 'MIN',
      label: '最小值'
    }, {
      title: 'MAX',
      label: '最大值'
    }];
  },
  [GETTER_RESULT_TYPES]() {
    return [{
      type: 'table',
      label: '表格'
    }, {
      type: 'chart-line',
      label: '折线图'
    }, {
      type: 'chart-bar',
      label: '柱状图'
    }, {
      type: 'chart-tree',
      label: '树图'
    }, {
      type: 'chart-treemap',
      label: 'Treemap'
    }, {
      type: 'chart-sunburst',
      label: '旭日图'
    }];
  }
};
