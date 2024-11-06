<script lang="ts" setup>
import { ProductType } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getProductTypeByID } = useProductType();

const router = useRouter();

const pending = ref(true)
const product_type = ref<ProductType>({
  product_type_id: '',
  product_type_name: '',
  product_type_detail: '',
})

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    product_type.value = await getProductTypeByID({ product_type_id: query.id })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/product-type' });
  }
})
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'ประเภทสินค้า', to: '/product-type', },
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
        <v-row>
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>รหัสประเภทสินค้า</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ product_type.product_type_id }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>ชื่อประเภทสินค้า</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ product_type.product_type_name }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>รายละอียด</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ product_type.product_type_detail }}</v-label>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/product-type'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>