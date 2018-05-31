import {Spin} from 'iview';

export default ['BiChart', () => {
  return {
    component: import(/* webpackChunkName: "chart" */ './chart.vue'),
    loading: Spin,
    delay: 200
  };
}];
