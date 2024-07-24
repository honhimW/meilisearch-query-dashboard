import { createRouter, createWebHistory, createWebHashHistory, type RouteMeta } from 'vue-router'
import DashboardLayoutVue from '@/layouts/dashboard.vue';

interface IRouteMeta {
  title: string
}

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard/query',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        title: 'Login',
      } as RouteMeta & IRouteMeta,
    },
    {
      path: '/dashboard',
      component: DashboardLayoutVue,
      redirect: '/dashboard/query',
      meta: {
        title: 'Dashboard',
      },
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/dashboard/examples/Home.vue'),
          meta: {
            title: 'Home',
          } as RouteMeta & IRouteMeta
        },
        {
          path: 'task',
          name: 'tasks_index',
          component: () => import('@/views/dashboard/examples/tasks/Index.vue'),
          beforeEnter: (to, from, next) => {
            console.log(to)
            if (Object.keys(to.query).length == 0) {
              to.fullPath += '?status=*&limit=20'
              to.query.status = '*'
              to.query.limit = '20'
            }
            next()
          },
          meta: {
            title: 'Tasks',
          } as RouteMeta & IRouteMeta
        },
        {
          path: 'query',
          name: 'query_index',
          component: () => import('@/views/dashboard/examples/query/DocumentDashboard.vue'),
          meta: {
            title: 'Query',
          } as RouteMeta & IRouteMeta
        },
        {
          path: 'settings',
          name: 'settings_index',
          component: () => import('@/views/dashboard/examples/settings/Index.vue'),
          meta: {
            title: 'Settings',
          } as RouteMeta & IRouteMeta
        },
      ],
    },
    {
      path: '/:pathMatch(.*)',
      name: 'not-found',
      component: () => import('@/views/404.vue'),
      meta: {
        title: 'Page Not Found',
      } as RouteMeta & IRouteMeta,
    },
  ]
});

router.beforeEach((loc) => {
  document.title = loc.meta.title as string;
})

export default router
