<script lang="ts" setup>
import { Project } from "~~/misc/types"

import defaultProjectImage from "@/assets/images/default-project.png"
import errorImage from "@/assets/images/error.png"

definePageMeta({ middleware: ["auth"] });

const { getProjectByID } = useProject();

const router = useRouter();

const { public: publicCtx } = useRuntimeConfig()

const pending = ref(false)
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

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    project.value = await getProjectByID({ project_id: query.id })
  } catch (e) {
    console.log(e)

    await router.push({ path: '/project' });
  }
})
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'ดูรายละเอียดโปรเจกต์', to: '/project', },
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
                <v-label>ชื่อโปรเจคต์</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ project.project_id }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>รายละเอียดโปรเจคต์</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ project.project_detail }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>กำหนดเริ่ม</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ project.project_start_date }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>กำหนดเสร็จ</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ project.project_end_date }}</v-label>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/project'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>