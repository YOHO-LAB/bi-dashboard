/**
 * 插件
 */
import components from '../components';
import _ from 'lodash';

export default {
  loadGlobalComponents(Vue) {
    _.each(components, componentModules => {
      _.each(componentModules, component => {
        if (component.length) {
          Vue.component(component[0], component[1]);
        } else {
          Vue.component(component.name, component);
        }
      });
    });
  },
  defineVueProp(Vue) {
    Vue.prop = (key, value) => {
      Vue[`$${key}`] = Vue.prototype[`$${key}`] = value;
    };
  },
  install(Vue) {
    // 定义Vue全局属性
    this.defineVueProp(Vue);

    // 加载核心组件
    this.loadGlobalComponents(Vue);
  }
};
