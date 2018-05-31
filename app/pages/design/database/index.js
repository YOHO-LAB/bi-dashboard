export default [{
  path: '/list',
  name: 'list',
  meta: {
    purview: '0104'
  },
  component: () => import(/* webpackChunkName: "database" */'./list')
}, {
  path: '/filter',
  name: 'filter',
  meta: {
    purview: '0104'
  },
  component: () => import(/* webpackChunkName: "database" */'./filter')
}];
