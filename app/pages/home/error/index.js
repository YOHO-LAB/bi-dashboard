export default [{
  path: '/404',
  alias: '/error/404',
  name: 'error404',
  meta: {
    auth: false
  },
  component: () => import(/* webpackChunkName: "error" */ './404')
}, {
  path: '/500',
  alias: '/error/500',
  name: 'error500',
  meta: {
    auth: false
  },
  component: () => import(/* webpackChunkName: "error" */ './500')
}];
