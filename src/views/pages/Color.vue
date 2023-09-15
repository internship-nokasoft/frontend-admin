<script setup>
import axios from 'axios';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const colors = ref(null);
const colorDialog = ref(false);
const deleteColorDialog = ref(false);
const deleteColorsDialog = ref(false);
const color = ref({});
const selectedColors = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);



onBeforeMount(() => {
    initFilters();
});

const fetchData = async () => {

    const colorResponse = await fetch('http://localhost:8000/api/admin/color', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const colorData = await colorResponse.json();
    colors.value = colorData.data;
};

onMounted(() => {
    fetchData();

});


const openNew = () => {
    color.value = {};
    submitted.value = false;
    colorDialog.value = true;
};

const hideDialog = () => {
    colorDialog.value = false;
    submitted.value = false;
};

const saveColor = async () => {
    submitted.value = true;
    if (color.value.color) {
        if (color.value.id) {
            const colorId = color.value.id;
            const response = await fetch(`http://localhost:8000/api/admin/color/${colorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    color: color.value.color,
                }),
            });
            fetchData();
            color.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Color Update', life: 3000 });
            colorDialog.value = false;
        } else {
            const response = await fetch('http://localhost:8000/api/admin/color', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    color: color.value.color,
                }),
            });
            fetchData();
            color.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Color Created', life: 3000 });
            colorDialog.value = false;
        }

    }
};

const editColor = (editColor) => {
    color.value = { ...editColor };
    console.log(color.value.id);
    colorDialog.value = true;
};

const confirmDeleteColor = (editColor) => {
    color.value = editColor;
    deleteColorDialog.value = true;
};


const deleteColor = async (colorId) => {

    const response = await fetch(`http://localhost:8000/api/admin/color/${colorId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    colors.value = colors.value.filter((val) => val.id !== colorId);
    deleteColorDialog.value = false;
    color.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Color Deleted', life: 3000 });


};


const confirmDeleteSelected = () => {
    deleteColorsDialog.value = true;
};
const deleteSelectedColors = async () => {
    const colorIds = Array.from(selectedColors.value.map(item => item.id));

    const response = await fetch(`http://localhost:8000/api/admin/colors/delete/${colorIds}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    colors.value = colors.value.filter((val) => !selectedColors.value.includes(val));
    deleteColorsDialog.value = false;
    selectedColors.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Colors Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected"
                                :disabled="!selectedColors || !selectedColors.length" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="colors" v-model:selection="selectedColors" dataKey="id" :paginator="true"
                    :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Colors"
                    responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Color</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 10%"></Column>

                    <Column field="name" header="Color" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Color</span>
                            {{ slotProps.data.color }}
                        </template>
                    </Column>
                    <Column field="slug" header="Slug" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Slug</span>
                            {{ slotProps.data.slug }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editColor(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteColor(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="colorDialog" :style="{ width: '450px' }" header="Add Size" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="name">Color Name</label>
                        <InputText id="name" v-model.trim="color.color" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !color.color }" />
                        <small class="p-invalid" v-if="submitted && !color.color">Color name is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveColor" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteColorDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="color">Are you sure you want to delete <b>{{ color.color }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteColorDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteColor(color.id)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteColorsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="color">Are you sure you want to delete the selected colors?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteColorsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedColors" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
