import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresGuest: true }
                },
                {
                    path: '/pages/product',
                    name: 'product',
                    component: () => import('@/views/pages/Product.vue')
                },
                {
                    path: '/pages/category',
                    name: 'category',
                    component: () => import('@/views/pages/Category.vue'),
                    meta: { requiresGuest: true }
                },
                {
                    path: '/pages/size',
                    name: 'size',
                    component: () => import('@/views/pages/Size.vue'),
                    meta: { requiresGuest: true }
                },
                {
                    path: '/pages/color',
                    name: 'color',
                    component: () => import('@/views/pages/Color.vue'),
                    meta: { requiresGuest: true }
                },
                
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/forgot-password',
            name: 'forgotpassword',
            component: () => import('@/views/pages/auth/ForgotPassword.vue')
        },
        {
            path: '/auth/reset-password',
            name: 'resetpassword',
            component: () => import('@/views/pages/auth/ResetPassword.vue'),
            props: (route) => ({
                email: route.query.email,
                token: route.query.token
            })
        },
    ]
});

router.beforeEach((to, from, next) => {
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);
  
    if (requiresGuest && isAuthenticated()) {
        next({ path: '/auth/login' }); 
    } else {
        next(); 
    }
});

function isAuthenticated() {
    
    const token = localStorage.getItem('token');
    return token === null;
}


export default router;
