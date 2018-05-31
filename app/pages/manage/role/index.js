export default {
  path: '/list',
  name: 'list',
  meta: {
    purview: '0302'
  },
  component: () => import(/* webpackChunkName: "role" */'./list')
};
