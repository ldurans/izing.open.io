
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'usuarios' },
    children: [
      { path: '/usuarios', name: 'usuarios', component: () => import('pages/usuarios/Index.vue') },
      { path: '/configuracoes', name: 'configuracoes', component: () => import('pages/configuracoes/Index.vue') },
      { path: '/channels', name: 'channels', component: () => import('pages/channels/Index.vue') }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/Login.vue')
  }
]

export default routes
