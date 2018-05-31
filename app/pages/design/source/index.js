export default [{
  path: '/detail/:id',
  name: 'detail',
  meta: {
    purview: '020604'
  },
  component: () => import(/* webpackChunkName: "data-source" */ './detail')
}, {
  path: '/:pid/list',
  name: 'list',
  meta: {
    purview: '020604'
  },
  component: () => import(/* webpackChunkName: "data-source" */'./list')
}];
