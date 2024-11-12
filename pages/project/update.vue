<script lang="ts" setup>
import Swal from "sweetalert2"
import { Project } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getLicenseBy, } = useLicense();
const { getProjectByID, updateProjectBy } = useProject();

const router = useRouter();

const pending = ref(false)
const submitting = ref(false)
const project = ref<Project>({
  project_id: '',
  project_name: '',
  project_detail: '',
  project_start_date: '',
  project_end_date: '',
  addby: '',
  adddate: '',
  updateby: '',
  lastupdate: '',
});

const license_options = ref<{ value: string; title: string; }[]>([])

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    const projectData = await getProjectByID({ project_id: query.id });
    project.value = {
      ...projectData,
      project_start_date: projectData.project_start_date?.substring(0, 10),
      project_end_date: projectData.project_end_date?.substring(0, 10),
    };
    const { docs: licenses } = await getLicenseBy({ sorter: { key: 'license_name', order: "ASC" }, })

    license_options.value = licenses.map(item => ({ value: item.license_id, title: item.license_name }))

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/project' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await updateProjectBy({
      project: project.value,
    });

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/project' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    project_id,
    project_name,
    project_detail,
    project_start_date,
    project_end_date,
  } = project.value

  if (!(project_id
    && project_name
    && project_detail
    && project_start_date
    && project_end_date
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'โปรเจคต์', to: '/project', },
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
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" sm="6" lg="3">
                <v-label class="mb-2">รหัสโปรเจค<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="project.project_id" density="compact" :rules="[rules.required]"
                  variant="outlined" disabled></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="4">
                <v-label class="mb-2">ชื่อโปรเจคต์<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="project.project_name" :rules="[rules.required]" density="compact"
                  variant="outlined"></v-text-field>
              </v-col>

            </v-row>
            <v-row>
              <v-col cols="12">
                <v-label class="mb-2">รายละเอียดโปรเจคต์</v-label>
                <v-textarea v-model="project.project_detail" :rules="[rules.required]" density="compact"
                  variant="outlined"></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="4">
                <label>
                  กำหนดเริ่ม:</label>
                <input type="date" :rules="[rules.required]" v-model="project.project_start_date">
              </v-col>
              <v-col cols="12" sm="6" lg="4">
                <label>กำหนดเสร็จ:</label>
                <input type="date" v-model="project.project_end_date">
              </v-col>
            </v-row>
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
      <v-btn color="muted" :to="'/project'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>