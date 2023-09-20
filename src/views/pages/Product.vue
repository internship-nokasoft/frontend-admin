<script setup>
import axios from 'axios';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import MultiSelect from 'primevue/multiselect';
import FileUpload from 'primevue/fileupload';

const toast = useToast();

const products = ref(null);
const sizes = ref(null);
const colors = ref(null);
const categories = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const dropdownCategoryValues = ref([]);
const dropdownSizeValues = ref([]);
const selectedSizes = ref([]);
const dropdownColorValues = ref([]);
const selectedColors = ref([]);
const image = ref("");



onBeforeMount(() => {
    initFilters();
});

const fetchData = async () => {
    const productResponse = await fetch('http://localhost:8000/api/admin/products', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const productData = await productResponse.json();
    // products.value = productData.data;
    products.value = productData.data.map(product => ({
        ...product,
        size: product.size.split(',').map(size => size.trim()),
        color: product.color.split(',').map(color => color.trim()),
    }));


};

const fetchDataColor = async () => {

    const colorResponse = await fetch('http://localhost:8000/api/admin/color', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const colorData = await colorResponse.json();
    colors.value = colorData.data;
    dropdownColorValues.value = colorData.data.map(color => color.color);
};

const fetchDataSize = async () => {
    const sizeResponse = await fetch('http://localhost:8000/api/admin/size', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const sizeData = await sizeResponse.json();
    sizes.value = sizeData.data;
    dropdownSizeValues.value = sizeData.data.map(size => size.size_name);
};

const fetchDataCategory = async () => {
    const categoryResponse = await fetch('http://localhost:8000/api/admin/categories', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    const categoryData = await categoryResponse.json();
    categories.value = categoryData.data;
    dropdownCategoryValues.value = categoryData.data.map(category => category.category_name);
    console.log(categories);
};

onMounted(() => {
    fetchData();
    fetchDataColor();
    fetchDataSize();
    fetchDataCategory();
});

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    console.log(dropdownSizeValues);
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

//get id category
const onCategoryChange = () => {

    const selectedCategory = categories.value.find(category => category.category_name === product.value.category_name);
    if (selectedCategory) {
        product.value.category_id = selectedCategory.id;
    }
};


const onUpload = (event) => {
    product.value.product_img = event.target.files[0];
    console.log(product.value.product_img);
};

const saveProduct = async () => {

    submitted.value = true;
    const formData = new FormData();
    formData.append('product_name', product.value.product_name);
    formData.append('category_id', product.value.category_id);
    formData.append('short_desc', product.value.short_desc);
    formData.append('desc', product.value.desc);
    formData.append('color', product.value.color);
    formData.append('size', product.value.size);
    formData.append('price', product.value.price);
    formData.append('quantity', product.value.quantity);
    formData.append('product_img', product.value.product_img);

    if (product.value.product_name) {
        if (product.value.id) {
            const productId = product.value.id;
            const response = await fetch(`http://localhost:8000/api/admin/product/${productId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });
            fetchData();
            product.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Update', life: 3000 });
            productDialog.value = false;
        } else {
            const response = await fetch('http://localhost:8000/api/admin/product', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (response) {
                fetchData();
                product.value = {};
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                productDialog.value = false;
            }

        }
    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    product.value.product_img = {};
    productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const deleteProduct = async (productId) => {
    const response = await fetch(`http://localhost:8000/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    products.value = products.value.filter((val) => val.id !== productId);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};



const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = async () => {
    const productIds = Array.from(selectedProducts.value.map(item => item.id));
    const response = await fetch(`http://localhost:8000/api/admin/products/delete/${productIds}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};



const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        product_name: { value: null, matchMode: FilterMatchMode.CONTAINS }
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
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="products" v-model:selection="selectedProducts" dataKey="id" :paginator="true"
                    :rows="50" :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[10, 20, 50]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Products</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['product_name'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="name" header="Name" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.product_name }}
                        </template>
                    </Column>
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="'http://localhost:8000/' + slotProps.data.product_img" :alt="slotProps.data.name"
                                class="shadow-2" width="100" />
                        </template>
                    </Column>

                    <Column field="price" header="Price" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.price) }}
                        </template>
                    </Column>
                    <Column field="category" header="Category" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.category_name }}
                        </template>
                    </Column>
                    <Column field="size" header="Size" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Size</span>
                            <span v-for="(size, index) in slotProps.data.size" :key="index">
                                {{ size }} &nbsp;
                            </span>
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Color" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Color</span>
                            <span v-for="(color, index) in slotProps.data.color" :key="index">
                                {{ color }} &nbsp;
                            </span>
                        </template>
                    </Column>
                    <Column field="quantity" header="Quantity" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Quantity</span>
                            {{ slotProps.data.quantity }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2"
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '600px' }" header="Add Product" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="name">Product Name</label>
                        <InputText id="name" v-model.trim="product.product_name" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !product.product_name }" />
                        <small class="p-invalid" v-if="submitted && !product.product_name">Name is required.</small>
                    </div>
                    <div class="field">
                        <label class="mb-3">Category</label>
                        <Dropdown v-model="product.category_name" :options="dropdownCategoryValues"
                            placeholder="Select Category" @change="onCategoryChange" />
                    </div>
                    <div class="field">
                        <label for="description">Product Short Description</label>
                        <Textarea id="description" v-model="product.short_desc" required="true" rows="2" cols="20" />
                    </div>
                    <div class="field">
                        <label for="description">Product Long Description</label>
                        <Textarea id="description" v-model="product.desc" required="true" rows="3" cols="20" />
                    </div>
                    <div class="field">
                        <label class="mb-3">Size</label>
                        <MultiSelect v-model="product.size" :options="dropdownSizeValues" placeholder="Select Size"
                            :filter="true">
                            <template #value="slotProps">
                                <div class="inline-flex align-items-center py-1 px-2 bg-primary text-primary border-round mr-2"
                                    v-for="selectedSizes of slotProps.value" :key="selectedSizes">
                                    <div>{{ selectedSizes }}</div>
                                </div>
                                <template v-if="!slotProps.value || slotProps.value.length === 0">
                                    <div class="p-1">Select Size</div>
                                </template>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center" v-for="selectedSize in slotProps.value"
                                    :key="selectedSize">
                                    <div>{{ selectedSize }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>
                    <div class="field">
                        <label class="mb-3">Color</label>
                        <MultiSelect v-model="product.color" :options="dropdownColorValues" placeholder="Select Color"
                            :filter="true">
                            <template #value="slotProps">
                                <div class="inline-flex align-items-center py-1 px-2 bg-primary text-primary border-round mr-2"
                                    v-for="selectedColors of slotProps.value" :key="selectedColors">
                                    <div>{{ selectedColors }}</div>
                                </div>
                                <template v-if="!slotProps.value || slotProps.value.length === 0">
                                    <div class="p-1">Select Color</div>
                                </template>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center" v-for="selectedColors in slotProps.value"
                                    :key="selectedColors">
                                    <div>{{ selectedColors }}</div>
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <div class="formgrid grid">
                        <div class="field col">
                            <label for="price">Price</label>
                            <InputNumber id="price" v-model="product.price" mode="currency" currency="VND" locale="en-US"
                                :class="{ 'p-invalid': submitted && !product.price }" :required="true" />
                            <small class="p-invalid" v-if="submitted && !product.price">Price is required.</small>
                        </div>
                        <div class="field col">
                            <label for="quantity">Quantity</label>
                            <InputNumber id="quantity" v-model="product.quantity" integeronly />
                        </div>
                    </div>
                    <div class="field">
                        <label>Product image</label>
                        <input type="file" @change="onUpload" class="form-control" />
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete <b>{{ product.product_name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct(product.id)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
