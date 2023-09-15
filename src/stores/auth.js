import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createStore } from 'vuex';

const router = useRouter();

export default createStore({
    state: {
        admin: JSON.parse(localStorage.getItem('admin')) || null,
        token: localStorage.getItem('token') || '',
        forgotPasswordStatus: null,
        resetPasswordStatus: null
    },

    getters: {
        isAdminLoggedIn: (state) => !!state.token,
        getAdmin: (state) => state.admin,
        getForgotPasswordStatus: (state) => state.forgotPasswordStatus,
        getResetPasswordStatus: (state) => state.resetPasswordStatus
    },

    mutations: {
        SET_ADMIN: (state, admin) => {
            state.admin = admin;
            if (admin) {
                localStorage.setItem('admin', JSON.stringify(admin));
            } else {
                localStorage.removeItem('admin');
            }
        },
        SET_TOKEN: (state, token) => {
            state.token = token;
            localStorage.setItem('token', token);
        },
        SET_FORGOT_PASSWORD_STATUS: (state, status) => {
            state.forgotPasswordStatus = status;
        },
        SET_RESET_PASSWORD_STATUS: (state, status) => {
            state.resetPasswordStatus = status;
        },
        LOGOUT: (state) => {
            state.admin = null;
            state.token = '';
            localStorage.removeItem('admin');
            localStorage.removeItem('token');
        }
    },

    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await fetch('http://localhost:8000/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token;
                    const admin = data.admin;
                    commit('SET_TOKEN', token);
                    commit('SET_ADMIN', admin);
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        },

        async register({ commit }, credentials) {
            try {
                const response = await fetch('http://localhost:8000/api/admin/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token;
                    const admin = data.admin;
                    commit('SET_TOKEN', token);
                    commit('SET_ADMIN', admin);
                    return true;
                } else {
                    console.log('Tạo tài khoản thất bại');
                    return false;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        },

        async forgotPassword({ commit }, email) {
            try {
                const response = await fetch('http://localhost:8000/api/admin/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(email)
                });

                if (response.ok) {
                    commit('SET_FORGOT_PASSWORD_STATUS', 'success');
                    return true;
                } else {
                    commit('SET_FORGOT_PASSWORD_STATUS', 'error');
                    return false;
                }
            } catch (error) {
                console.error(error);
                s;
                commit('SET_FORGOT_PASSWORD_STATUS', 'error');
                return false;
            }
        },

        async resetPassword({ commit }, credentials) {
            try {
                const response = await fetch('http://localhost:8000/api/admin/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (response.ok) {
                    commit('SET_RESET_PASSWORD_STATUS', 'success');
                    return true;
                } else {
                    commit('SET_RESET_PASSWORD_STATUS', 'error');
                    return false;
                }
            } catch (error) {
                console.error(error);
                commit('SET_RESET_PASSWORD_STATUS', 'error');
                return false;
            }
        },
        async logout({ commit }) {
            try {
                const response = await fetch('http://localhost:8000/api/admin/logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                  }
                });
                if (response.ok) {
                  commit('LOGOUT'); 
                  return true;
                } else {
                  return false;
                }
              } catch (error) {
                console.error(error);
                return false;
              }
        }
    }
});
