<script lang="ts" setup>
import Swal from "sweetalert2"
import { ProductCategory } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { generateProductCategoryID, insertProductCategory, } = useProductCategory();

const router = useRouter();

const pending = ref(true)
const submitting = ref(false)
const product_category = ref<ProductCategory>({
  product_category_id: '',
  product_category_name: '',
  product_category_detail: '',
});

onMounted(async () => {
  try {
    const id = await generateProductCategoryID()

    product_category.value.product_category_id = id

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/product-category' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await insertProductCategory(product_category.value);
    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/product-category' });
  } catch (e) {
    console.log(e)
    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    product_category_id,
    product_category_name,
  } = product_category.value

  if (!(product_category_id && product_category_name)) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }
  return true
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'หมวดหมู่สินค้า', to: '/product-category', },
    { title: 'เพิ่มรายการใหม่', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>เพิ่มรายการใหม่</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" sm="6" lg="4">
            <v-label class="mb-2">รหัสหมวดหมู่ <span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="product_category.product_category_id" density="compact" :rules="[rules.required]"
              variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" lg="4">
            <v-label class="mb-2">ชื่อหมวดหมู่ <span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="product_category.product_category_name" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="8" lg="8">
            <v-label class="mb-2">รายละอียด</v-label>
            <v-textarea v-model="product_category.product_category_detail" density="compact"
              variant="outlined"></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="'/product-category'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>