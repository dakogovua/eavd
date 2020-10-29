
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageIndex.vue'),  name: 'Withdraw page' },
      { path: 'notes', component: () => import('pages/PageNotes.vue'),  name: 'Notes page' },
      { path: 'login', component: () => import('pages/PageLogin.vue'),  name: 'Login page' },
      { path: 'withdraw', component: () => import('pages/PageWithdraw.vue'),  name: 'Withdraw page w/ components' }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
