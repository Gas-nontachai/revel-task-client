<script lang="ts" setup>
import { Supplier } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getSupplierByID } = useSupplier();

const router = useRouter()

const pending = ref(true)
const supplier = ref<Supplier>({
  supplier_id: '',
  company_id: '',
  branch_id: '',
  supplier_main_id: '',
  supplier_origin_id: '',
  supplier_name: '',
  supplier_contact_name: '',
  supplier_contact1: '',
  supplier_contact2: '',
  supplier_contact3: '',
  supplier_address: '',
  supplier_tax: '',
  supplier_vat_type: 'exc',
  supplier_vat_rate: 0,
  supplier_remark: '',
});

const vat_type = {
  exc: 'แยกภาษี',
  inc: 'รวมภาษี',
}

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    supplier.value = await getSupplierByID({ supplier_id: query.id })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/supplier' });
  }
})
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'ผู้ขาย', to: '/supplier', },
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
                <th style="width: 180px"></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-right">รหัสผู้ขาย :</td>
                <td class="text-muted">{{ supplier.supplier_id }}</td>
              </tr>
              <tr>
                <td class="text-right">รหัสผู้ขาย (เดิม):</td>
                <td class="text-muted">{{ supplier.supplier_origin_id }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อบริษัท/ผู้ขาย :</td>
                <td class="text-muted">{{ supplier.supplier_name }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อผู้ติดต่อ :</td>
                <td class="text-muted">{{ supplier.supplier_contact_name }}</td>
              </tr>
              <tr>
                <td class="text-right">เลขประจำตัวผู้เสียภาษี :</td>
                <td class="text-muted">{{ supplier.supplier_tax }}</td>
              </tr>
              <tr>
                <td class="text-right">ภาษีเงินได้ % ภาษี :</td>
                <td class="text-muted">
                  <template v-if="supplier.supplier_vat_rate">
                    {{ `${vat_type[supplier.supplier_vat_type] ?? vat_type.exc} ${supplier.supplier_vat_rate}%` }}
                  </template>
                  <template v-else>-</template>
                </td>
              </tr>
              <tr>
                <td class="text-right">ช่องทางติดต่อ :</td>
                <td class="text-muted">
                  <div>{{ supplier.supplier_contact1 }}</div>
                  <div>{{ supplier.supplier_contact2 }}</div>
                  <div>{{ supplier.supplier_contact2 }}</div>
                </td>
              </tr>
              <tr>
                <td class="text-right">ที่อยู่ :</td>
                <td class="text-muted">
                  <div>{{ supplier.supplier_address }}</div>
                </td>
              </tr>
              <tr>
                <td class="text-right">บันทึกช่วยจำ :</td>
                <td class="text-muted">
                  <div>{{ supplier.supplier_remark }}</div>
                </td>
              </tr>
              <tr>
                <td class="text-right">แหล่งข้อมูล บริษัท-สาขา:</td>
                <td class="text-muted">{{ supplier.branch_name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/supplier'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>