<script lang="ts" setup>
import Swal from "sweetalert2"
import { Product } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getBranchBy } = useBranch();
const { getProductCategoryBy } = useProductCategory();
const { getProductTypeBy } = useProductType();
const { getProductBy, getProductByID, updateProductBy, } = useProduct();

const router = useRouter();

const pending = ref(true)
const submitting = ref(false)
const product = ref<Product>({
  product_id: '',
  branch_id: '',
  product_origin_id: '',
  product_category_id: '',
  product_main_id: '',
  product_type_id: '',
  product_name: '',
  product_description: '',
  product_unit_name1: 'กก.',
  product_unit_name2: '',
  product_unit_name3: '',
  product_unit_name4: '',
  product_unit_name5: '',
  product_unit_qty1: 1,
  product_unit_qty2: null,
  product_unit_qty3: null,
  product_unit_qty4: null,
  product_unit_qty5: null,
  product_unit_conv1: 1,
  product_unit_conv2: null,
  product_unit_conv3: null,
  product_unit_conv4: null,
  product_unit_conv5: null,
  product_status: 'active',
})
const products = ref<Product[]>([])
const branch_options = ref<{ value: string; title: string; }[]>([])
const product_category_options = ref<{ value: string; title: string; }[]>([])
const product_type_options = ref<{ value: string; title: string; }[]>([])

const product_options = computed(() => products.value.map(item => ({ value: item.product_id, title: `${item.product_origin_id} - ${item.product_name} (${item.product_id})` })))

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    product.value = await getProductByID({ product_id: query.id })

    const { docs: branchs } = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, })
    const { docs: product_categorys } = await getProductCategoryBy({ sorter: { key: 'product_category_name', order: "ASC" }, })
    const { docs: product_types } = await getProductTypeBy({ sorter: { key: 'product_type_name', order: "ASC" }, })

    await fetchSameProduct()

    branch_options.value = branchs.map(item => ({ value: item.branch_id, title: item.branch_name, }))
    product_category_options.value = product_categorys.map(item => ({ value: item.product_category_id, title: item.product_category_name, }))
    product_type_options.value = product_types.map(item => ({ value: item.product_type_id, title: item.product_type_name, }))

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/product' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await updateProductBy(product.value);

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/product' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    product_name,
  } = product.value

  if (!product_name) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}

async function fetchSameProduct() {
  try {
    const { product_id, branch_id, } = product.value

    products.value = await getProductBy({
      match: {
        product_id: { $ne: product_id },
        'tb.branch_id': { $ne: branch_id },
        $or: [
          { product_main_id: { $ne: product_id }, },
          { product_main_id: null },
        ]
      }
    }).then(res => res.docs)
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'สินค้า', to: '/product', },
    { title: 'แก้ไขรายการ', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>แก้ไขรายการ</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">รหัสสินค้า<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="product.product_id" density="compact" variant="outlined" disabled></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">รหัสสินค้า (เดิม)</v-label>
            <v-text-field v-model="product.product_origin_id" density="compact" variant="outlined"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-label class="mb-2">ชื่อสินค้า<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="product.product_name" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">หมวดหมู่</v-label>
            <v-autocomplete v-model="product.product_category_id" :items="product_category_options" density="compact"
              variant="outlined" v-on:update:model-value="fetchSameProduct"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" lg="3">
            <v-label class="mb-2">ประเภท</v-label>
            <v-autocomplete v-model="product.product_type_id" :items="product_type_options" density="compact"
              variant="outlined" v-on:update:model-value="fetchSameProduct"></v-autocomplete>
          </v-col>
          <v-col cols="12">
            <v-label class="mb-2">รายละอียด</v-label>
            <v-textarea v-model="product.product_description" density="compact" variant="outlined"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" lg="4">
            <v-label class="mb-2">แหล่งข้อมูล บริษัท-สาขา<span class="text-error ml-1">*</span></v-label>
            <v-autocomplete v-model="product.branch_id" :items="branch_options" density="compact" variant="outlined"
              :disabled="!!product.product_origin_id" v-on:update:model-value="fetchSameProduct"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <v-label class="mb-2">สินค้าเดียวกัน</v-label>
            <v-autocomplete v-model="product.product_main_id" :items="product_options" density="compact"
              variant="outlined"></v-autocomplete>
          </v-col>
        </v-row>
        <v-divider class="border-opacity-100 my-2"></v-divider>
        <div style="overflow-x: auto">
          <table class="table-detail" style="min-width: 800px" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 200px">หน่วยสินค้า</th>
                <th style="width: 160px">จำนวนต่อหน่วย</th>
                <th style="width: 160px">น้ำหนักต่อหน่วย</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <v-text-field v-model="product.product_unit_name1" density="compact" variant="outlined" hide-details
                    :disabled="!!product.product_origin_id"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_qty1" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_conv1" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
              </tr>
              <tr>
                <td>
                  <v-text-field v-model="product.product_unit_name2" density="compact" variant="outlined" hide-details
                    :disabled="!!product.product_origin_id"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_qty2" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_conv2" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
              </tr>
              <tr>
                <td>
                  <v-text-field v-model="product.product_unit_name3" density="compact" variant="outlined" hide-details
                    :disabled="!!product.product_origin_id"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_qty3" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_conv3" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
              </tr>
              <tr>
                <td>
                  <v-text-field v-model="product.product_unit_name4" density="compact" variant="outlined" hide-details
                    :disabled="!!product.product_origin_id"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_qty4" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_conv4" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
              </tr>
              <tr>
                <td>
                  <v-text-field v-model="product.product_unit_name5" density="compact" variant="outlined" hide-details
                    :disabled="!!product.product_origin_id"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_qty5" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
                <td>
                  <v-text-field v-model="product.product_unit_conv5" class="text-right" density="compact"
                    variant="outlined" hide-details :disabled="!!product.product_origin_id"
                    @keypress="onlyNumeric"></v-text-field>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="'/product'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>