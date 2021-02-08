
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: { name: 'contatos' },
    children: [
      { path: '', component: () => import('pages/contatos/Index.vue') },
      { path: '/painel-tickets', name: 'painel-tickets', component: () => import('pages/dashboard/DashTicketsFilas.vue') },
      // { path: '/ConsultarTicketsQueuesService', name: 'dashboard', component: () => import('pages/dashboard/Index.vue') },
      { path: '/sessoes', name: 'sessoes', component: () => import('pages/sessaoWhatsapp/Index.vue') },
      { path: '/contatos', name: 'contatos', component: () => import('pages/contatos/Index.vue') },
      { path: '/usuarios', name: 'usuarios', component: () => import('pages/usuarios/Index.vue') },
      { path: '/auto-resposta', name: 'auto-resposta', component: () => import('pages/fluxoAutoResposta/Index.vue') },
      { path: '/mensagens-rapidas', name: 'mensagens-rapidas', component: () => import('pages/mensagensRapidas/Index.vue') },
      { path: '/filas', name: 'filas', component: () => import('pages/filas/Index.vue') },
      { path: '/configuracoes', name: 'configuracoes', component: () => import('pages/configuracoes/Index.vue') }
    ]
  },
  {
    path: '/atendimento',
    name: 'atendimento',
    redirect: { name: 'chat-empty' },
    component: () => import('pages/atendimento/Index.vue'),
    children: [
      {
        path: '/atendimento/chats/',
        name: 'chat-empty',
        component: () => import('pages/atendimento/Chat.vue')
      },
      {
        path: 'contatos',
        name: 'chat-contatos',
        component: () => import('pages/contatos/Index.vue'),
        props: { isChatContact: true }
      },
      {
        path: '/atendimento/:ticketId',
        name: 'chat',
        component: () => import('pages/atendimento/Chat.vue'),
        beforeEnter (to, from, next) {
          if (!from.params.ticketId) {
            next({ name: 'chat-empty' })
          }
          next()
        }
      }

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
