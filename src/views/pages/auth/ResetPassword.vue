<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted, defineComponent } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useStore } from 'vuex';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const token = ref('');
const checked = ref(false);
const check = ref(false);
const submitted = ref(false);

const router = useRouter();
const store = useStore();
const toast = useToast();


onMounted(() => {
    const queryParams = router.currentRoute.value.query;
    if (queryParams.email) {
        email.value = queryParams.email;
    }
    if (queryParams.token) {
        token.value = queryParams.token;
    }

    // Log query params
    console.log('Email:', atob(email.value));
    console.log('Token:', token.value);
});

const resetPassword = async () => {
    try {
        submitted.value = true;

        const credentials = {
            token: token.value,
            email: atob(email.value), 
            password: password.value,
        };

        const resetPassword = await store.dispatch('resetPassword', credentials);

        if (resetPassword) {
            console.log('OK');
        } else {
            console.log('Error');
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
                        <div class="text-900 text-3xl font-medium mb-3">Welcome!</div>
                        <span class="text-600 font-medium">Reset Password</span>
                    </div>
                    <div>
                        <label for="password" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password" v-model="password" placeholder="Password" :toggleMask="true"
                            class="w-full mb-5" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                        <small v-if="submitted && !password" class="text-red-500">Password is required.</small>

                        <Button label="Reset Password" class="w-full p-3 text-xl" @click="resetPassword"></Button>
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
