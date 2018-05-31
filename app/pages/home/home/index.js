export default {
  path: '/',
  alias: '/',
  name: 'home',
  meta: {
    purview: false
  },
  component: () => import(/* webpackChunkName: "home" */ './home')
};
