<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);
const check = ref(false);
const submitted = ref(false);

const router = useRouter();
const store = useStore();

const login = () => {
    router.push('/auth/login');
};

const register = async () => {
    try {
        submitted.value = true;

        const adminData = {
            name: username.value,
            email: email.value,
            password: password.value
        };

        const register = await store.dispatch('register', adminData);

        if (register) {
            console.log('OK');
            // router.push('/pages/product');
        } else {
            console.log('Tạo tài khoản thất bại');
        }

    } catch (error) {
        console.error(error);
    }

};

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Welcome!</div>
                        <span class="text-600 font-medium">Register to continue</span>
                    </div>
                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
                        <InputText id="username" type="text" placeholder="Username" class="w-full md:w-30rem mb-5"
                            style="padding: 1rem" v-model="username" />
                        <small v-if="submitted && !username" class="text-red-500">Username is required.</small>

                        <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5"
                            style="padding: 1rem" v-model="email" />
                        <small v-if="submitted && !email" class="text-red-500">Email is required.</small>

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password" v-model="password" placeholder="Password" :toggleMask="true"
                            class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                        <small v-if="submitted && !password" class="text-red-500">Password is required.</small>
                        
                        <Button label="Register" class="w-full p-3 text-xl" @click="register"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
