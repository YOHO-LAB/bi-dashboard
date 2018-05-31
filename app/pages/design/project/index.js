export default [{
  path: '/list',
  name: 'list',
  meta: {
    purview: '0207'
  },
  component: () => import(/* webpackChunkName: "project" */'./list')
}];
