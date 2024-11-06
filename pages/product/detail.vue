<script lang="ts" setup>
import { Product } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getProductByID } = useProduct();

const router = useRouter();

const pending = ref(true)
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
});

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    product.value = await getProductByID({ product_id: query.id })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/product' });
  }
})
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'สินค้า', to: '/product', },
    { title: 'รายละเอียด', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>รายละเอียด</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text>
        <div style="overflow-x: auto">
          <table class="table-detail" style="min-width: 800px" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 120px"></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-right">รหัสสินค้า :</td>
                <td class="text-muted">{{ product.product_id }}</td>
              </tr>
              <tr>
                <td class="text-right">รหัสสินค้า(เดิม) :</td>
                <td class="text-muted">{{ product.product_origin_id }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อสินค้า :</td>
                <td class="text-muted">{{ product.product_name }}</td>
              </tr>
              <tr>
                <td class="text-right">รายละอียด :</td>
                <td class="text-muted">{{ product.product_description }}</td>
              </tr>
              <tr>
                <td class="text-right">หมวดหมู่สินค้า :</td>
                <td class="text-muted">{{ product.product_category_name }}</td>
              </tr>
              <tr>
                <td class="text-right">ประเภทสินค้า :</td>
                <td class="text-muted">{{ product.product_type_name }}</td>
              </tr>
              <tr>
                <td class="text-right">บริษัท-สาขา:</td>
                <td class="text-muted">{{ product.branch_name }}</td>
              </tr>
            </tbody>
          </table>
          <v-divider class="border-opacity-100 my-2"></v-divider>
          <table class="table table-bordered" style="max-width: 500px;" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 140px">หน่วยสินค้า</th>
                <th style="width: 140px">จำนวนต่อหน่วย</th>
                <th style="width: 140px">น้ำหนักต่อหน่วย</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">{{ product.product_unit_name1 }}</td>
                <td class="text-right">{{ product.product_unit_qty1 }}</td>
                <td class="text-right">{{ product.product_unit_conv1 }}</td>
              </tr>
              <tr v-if="product.product_unit_qty2">
                <td class="text-center">{{ product.product_unit_name2 }}</td>
                <td class="text-right">{{ product.product_unit_qty2 }}</td>
                <td class="text-right">{{ product.product_unit_conv2 }}</td>
              </tr>
              <tr v-if="product.product_unit_qty3">
                <td class="text-center">{{ product.product_unit_name3 }}</td>
                <td class="text-right">{{ product.product_unit_qty3 }}</td>
                <td class="text-right">{{ product.product_unit_conv3 }}</td>
              </tr>
              <tr v-if="product.product_unit_qty4">
                <td class="text-center">{{ product.product_unit_name4 }}</td>
                <td class="text-right">{{ product.product_unit_qty4 }}</td>
                <td class="text-right">{{ product.product_unit_conv4 }}</td>
              </tr>
              <tr v-if="product.product_unit_qty5">
                <td class="text-center">{{ product.product_unit_name5 }}</td>
                <td class="text-right">{{ product.product_unit_qty5 }}</td>
                <td class="text-right">{{ product.product_unit_conv5 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/product'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>