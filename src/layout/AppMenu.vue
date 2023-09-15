<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },

    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            
            {
                label: 'Category',
                icon: 'pi pi-align-justify',
                to: '/pages/category'
            },
            {
                label: 'Size',
                icon: 'pi pi-plus',
                to: '/pages/size'
            },
            {
                label: 'Color',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/color'
            },
            {
                label: 'Product',
                icon: 'pi pi-fw pi-th-large',
                to: '/pages/product'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
