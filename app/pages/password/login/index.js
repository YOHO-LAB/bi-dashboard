export default {
  path: '/login',
  alias: '/login',
  name: 'login',
  meta: {
    auth: false
  },
  component: () => import(/* webpackChunkName: "password" */'./login')
};
