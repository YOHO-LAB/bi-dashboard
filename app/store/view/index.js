import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
  state: {
    viewResultFetching: false, // 获取表格数据加载状态，loading
    viewData: {}, // 面包屑数据
    worksheets: [], // 工作簿列表集合
    dashboards: [], // 工作簿表格结果列表集合
    previewResults: [], // 预览工作簿集合
    outputing: false,
    saveing: false
  },
  mutations,
  actions,
  getters
};
