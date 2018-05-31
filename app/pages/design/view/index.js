export default [{
  path: '/:pid/detail/:id',
  name: 'detail',
  meta: {
    purview: '020505'
  },
  component: () => import(/* webpackChunkName: "view" */ './detail')
}, {
  path: '/:pid/list',
  name: 'list',
  meta: {
    purview: '020505'
  },
  component: () => import(/* webpackChunkName: "view" */'./list')
}];
