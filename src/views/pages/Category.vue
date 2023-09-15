<script setup>
import axios from 'axios';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();


const categories = ref(null);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const deleteCategoriesDialog = ref(false);
const category = ref({});
const product = ref({});
const selectedCategory = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);



onBeforeMount(() => {
    initFilters();
});

const fetchData = async () => {
    const categoryResponse = await fetch('http://localhost:8000/api/admin/categories', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const categoryData = await categoryResponse.json();
    categories.value = categoryData.data;
};

onMounted(() => {
    fetchData();
});

const openNew = () => {
    category.value = {};
    submitted.value = false;
    categoryDialog.value = true;
};

const hideDialog = () => {
    categoryDialog.value = false;
    submitted.value = false;
};

const saveCategory = async () => {
    submitted.value = true;
    if (category.value.category_name) {
        if (category.value.id) {
            const categoryId = category.value.id;
            const response = await fetch(`http://localhost:8000/api/admin/category/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    category_name: category.value.category_name,
                }),
            });
            fetchData();
            category.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Catetory Update', life: 3000 });
            categoryDialog.value = false;
        } else {
            const response = await fetch('http://localhost:8000/api/admin/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    category_name: category.value.category_name,
                }),
            });
            fetchData();
            category.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Catetory Created', life: 3000 });
            categoryDialog.value = false;
        }

    }

};

const editCategory = (editCategory) => {
    category.value = { ...editCategory };
    console.log(category.value.id);
    categoryDialog.value = true;
};

const confirmDeleteCategory = (editCategory) => {
    category.value = editCategory;
    deleteCategoryDialog.value = true;
};


const deleteCategory = async (categoryId) => {

    const response = await fetch(`http://localhost:8000/api/admin/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    categories.value = categories.value.filter((val) => val.id !== categoryId);
    deleteCategoryDialog.value = false;
    category.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'category Deleted', life: 3000 });


};

const confirmDeleteSelected = () => {
    deleteCategoriesDialog.value = true;
};
const deleteSelectedCategory = async () => {
    const categoryIds = Array.from(selectedCategory.value.map(item => item.id));

    const response = await fetch(`http://localhost:8000/api/admin/categories/delete/${categoryIds}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    categories.value = categories.value.filter((val) => !selectedCategory.value.includes(val));
    deleteCategoriesDialog.value = false;
    selectedCategory.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Categories Deleted', life: 3000 });

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
                                :disabled="!selectedCategory || !selectedCategory.length" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="categories" v-model:selection="selectedCategory" dataKey="id" :paginator="true"
                    :rows="10" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                    responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Category</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 10%"></Column>

                    <Column field="name" header="Category Name" headerStyle="width:30%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name Category</span>
                            {{ slotProps.data.category_name }}
                        </template>
                    </Column>
                    <Column field="product" header="Product" headerStyle="width:30%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Product</span>
                            {{ slotProps.data.product_cout }}
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
                                @click="editCategory(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteCategory(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="categoryDialog" :style="{ width: '450px' }" header="Add category" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="category_name">Category Name</label>
                        <InputText id="category_name" v-model.trim="category.category_name" required="true" autofocus
                            :class="{ 'p-invalid': categoryError }" />
                        <small class="p-invalid" v-if="categoryError">Category is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveCategory" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="category">Are you sure you want to delete <b>{{ category.category_name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteCategoryDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteCategory(category.id)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteCategoriesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected category?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text"
                            @click="deleteCategoriesDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedCategory" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>


