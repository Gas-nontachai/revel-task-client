<script lang="ts" setup>
import Swal from "sweetalert2"
import { Company } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getUserBy, } = useUser();
const { getCompanyByID, updateCompanyBy } = useCompany();

const router = useRouter();

const pending = ref(true)
const submitting = ref(false)
const company = ref<Company>({
  company_id: '',
  company_name: '',
  company_tel: '',
  company_address: '',
});
const user_options = ref<{ value: string; title: string; }[]>([])

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    company.value = await getCompanyByID({ company_id: query.id })

    const { docs: users } = await getUserBy({
      sorter: { key: 'user_firstname', order: "ASC" },
    })

    user_options.value = users.map(item => ({ value: item.user_id, title: item.user_fullname ?? item.user_firstname, }))

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/company' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await updateCompanyBy(company.value);

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/company' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    company_id,
    company_name,
  } = company.value

  if (!(company_id && company_name)) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'บริษัท', to: '/company', },
    { title: 'แก้ไขรายการ', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>แก้ไขรายการ</v-card-title>
    <v-card-text class="py-4">
      <v-row>
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" md="6" lg="3">
              <v-label class="mb-2">รหัสบริษัท<span class="text-error ml-1">*</span></v-label>
              <v-text-field v-model="company.company_id" density="compact" disabled variant="outlined"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6" lg="8">
              <v-label class="mb-2">ชื่อบริษัท<span class="text-error ml-1">*</span></v-label>
              <v-text-field v-model="company.company_name" :rules="[rules.required]" density="compact"
                variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="6" lg="4">
              <v-label class="mb-2">โทรศัพท์<span class="text-error ml-1">*</span></v-label>
              <v-text-field v-model="company.company_tel" density="compact" variant="outlined"></v-text-field>
            </v-col>
          </v-row>
          <v-label class="mb-2">ที่อยู่</v-label>
          <v-textarea v-model="company.company_address" density="compact" variant="outlined"></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="'/company'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>