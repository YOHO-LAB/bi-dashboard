export default {
  path: '/list',
  name: 'list',
  meta: {
    purview: '0301'
  },
  component: () => import(/* webpackChunkName: "user" */'./list')
};
