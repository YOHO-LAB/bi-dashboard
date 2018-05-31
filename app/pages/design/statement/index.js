export default [{
  path: '/project/list',
  name: 'project.list',
  meta: {
    purview: '020506'
  },
  component: () => import(/* webpackChunkName: "statement" */'./list')
}, {
  path: '/:pid/view/list',
  name: 'project.view.list',
  meta: {
    purview: '020506'
  },
  component: () => import(/* webpackChunkName: "statement" */'./view-list')
}, {
  path: '/view/:id/detail',
  name: 'project.view.detail',
  meta: {
    purview: '020506'
  },
  component: () => import(/* webpackChunkName: "statement" */'./view-detail')
}];
