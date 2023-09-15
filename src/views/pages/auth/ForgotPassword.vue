<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useStore } from 'vuex';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);
const check = ref(false);
const submitted = ref(false);

const router = useRouter();
const store = useStore();
const toast = useToast();

const login = () => {
    router.push('/auth/login');
};

const forgotpassword = async () => {
    try {
        submitted.value = true;

        const emailforgot = {
            email: email.value,
        };

        const forgotPassword = await store.dispatch('forgotPassword', emailforgot);

        if (forgotPassword) {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Check your email to reset your password.', life: 10000 });
            console.log('OK');
        } else {
            console.log('Sai email');
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
            <Toast />
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Welcome!</div>
                        <span class="text-600 font-medium">Forgot Password</span>
                    </div>
                    <div>
                        <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="text" placeholder="Email address" class="w-full mb-2"
                            style="padding: 1rem" v-model="email" />
                        <small v-if="submitted && !email" class="text-red-500 mb-1">Email is required.</small>

                        <Button label="Forgot Password" class="w-full p-3 text-xl" @click="forgotpassword"></Button>
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
