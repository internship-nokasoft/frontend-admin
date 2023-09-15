<script setup>
import axios from 'axios';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();


const sizes = ref(null);
const SizeDialog = ref(false);
const deleteSizeDialog = ref(false);
const deleteSizesDialog = ref(false);
const size = ref({});
const selectedSizes = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);



onBeforeMount(() => {
    initFilters();
});

const fetchData = async () => {
    const sizeResponse = await fetch('http://localhost:8000/api/admin/size', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const sizeData = await sizeResponse.json();
    sizes.value = sizeData.data;
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    size.value = {};
    submitted.value = false;
    SizeDialog.value = true;
};

const hideDialog = () => {
    SizeDialog.value = false;
    submitted.value = false;
};

const saveSize = async () => {
    submitted.value = true;
    if (size.value.size_name) {
        if (size.value.id) {
            const sizeId = size.value.id;
            const response = await fetch(`http://localhost:8000/api/admin/size/${sizeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    size_name: size.value.size_name,
                }),
            });
            fetchData();
            size.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Size Update', life: 3000 });
            SizeDialog.value = false;
        } else {
            const response = await fetch('http://localhost:8000/api/admin/size', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    size_name: size.value.size_name,
                }),
            });
            fetchData();
            size.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Size Created', life: 3000 });
            SizeDialog.value = false;
        }

    }
};

const editSize = (editSize) => {
    size.value = { ...editSize };
    console.log(size.value.id);
    SizeDialog.value = true;
};

const confirmDeleteSize = (editSize) => {
    size.value = editSize;
    deleteSizeDialog.value = true;
};


const deleteSize = async (sizeId) => {

    const response = await fetch(`http://localhost:8000/api/admin/size/${sizeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    sizes.value = sizes.value.filter((val) => val.id !== sizeId);
    deleteSizeDialog.value = false;
    size.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Size Deleted', life: 3000 });


};


const confirmDeleteSelected = () => {
    deleteSizesDialog.value = true;
};
const deleteSelectedSizes = async () => {
    const sizeIds = Array.from(selectedSizes.value.map(item => item.id));

    const response = await fetch(`http://localhost:8000/api/admin/sizes/delete/${sizeIds}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    sizes.value = sizes.value.filter((val) => !selectedSizes.value.includes(val));
    deleteSizesDialog.value = false;
    selectedSizes.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Sizes Deleted', life: 3000 });
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
                                :disabled="!selectedSizes || !selectedSizes.length" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="sizes" v-model:selection="selectedSizes" dataKey="id" :paginator="true"
                    :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Sizes" responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Size</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 10%"></Column>

                    <Column field="name" header="Size" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Size</span>
                            {{ slotProps.data.size_name }}
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
                                @click="editSize(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteSize(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="SizeDialog" :style="{ width: '450px' }" header="Add Size" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="name">Size Name</label>
                        <InputText id="name" v-model.trim="size.size_name" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !size.size_name }" />
                        <small class="p-invalid" v-if="submitted && !size.size_name">Size name is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveSize" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteSizeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="size">Are you sure you want to delete <b>{{ size.size_name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteSizeDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSize(size.id)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteSizesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="size">Are you sure you want to delete the selected sizes?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteSizesDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedSizes" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
