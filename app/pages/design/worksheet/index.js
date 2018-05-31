export default [{
  path: '/:pid/detail/:id',
  name: 'detail',
  meta: {
    purview: '020404'
  },
  component: () => import(/* webpackChunkName: "worksheet" */ './detail')
}, {
  path: '/:pid/list',
  name: 'list',
  meta: {
    purview: '020404'
  },
  component: () => import(/* webpackChunkName: "project" */'./list')
}];
