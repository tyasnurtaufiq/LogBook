import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

import LandingView from '../views/LandingView.vue';
import LoginView from '../views/LoginView.vue';
import SummaryView from '../views/dashboard/SummaryView.vue';
import AttendanceListView from '../views/dashboard/AttendanceListView.vue';
import SettingsView from '../views/dashboard/SettingsView.vue';
import AuditLogsView from '../views/dashboard/AuditLogsView.vue';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { title: 'Presensi Pribadi • LogBook' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true, title: 'Masuk Admin • LogBook' }
  },
  {
    path: '/dashboard',
    name: 'dashboard-summary',
    component: SummaryView,
    meta: { requiresAuth: true, title: 'Ringkasan Presensi • LogBook' }
  },
  {
    path: '/dashboard/attendances',
    name: 'dashboard-attendances',
    component: AttendanceListView,
    meta: { requiresAuth: true, title: 'Data Presensi • LogBook' }
  },
  {
    path: '/dashboard/settings',
    name: 'dashboard-settings',
    component: SettingsView,
    meta: { requiresAuth: true, title: 'Pengaturan Sistem • LogBook' }
  },
  {
    path: '/dashboard/audit-logs',
    name: 'dashboard-audit-logs',
    component: AuditLogsView,
    meta: { requiresAuth: true, title: 'Audit Log • LogBook' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Set document title
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next('/dashboard');
  }

  next();
});

export default router;
