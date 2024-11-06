<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import { Branch, Company } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getCompanyByID } = useCompany();
const { getBranchBy } = useBranch();

const router = useRouter();

type Headers = InstanceType<typeof VDataTable>['headers']

const pending = ref(true)
const pending_branch = ref(true)
const pagination = ref({ page: 1, size: 20, sorter: [], })
const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "branch_id", title: "รหัสสาขา", width: 160, },
  { key: "branch_name", title: "สาขา", },
  { key: "branch_tel", title: "โทรศัพท์", width: 200 },
];
const company = ref<Company>({
  company_id: '',
  company_name: '',
  company_tel: '',
  company_address: '',
})
const branchs = ref<{
  docs: Branch[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
})

watch([pagination, company], () => fetchBranch(), { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    company.value = await getCompanyByID({ company_id: query.id })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/company' });
  }
})

async function fetchBranch() {
  const { company_id } = company.value

  if (!company_id) return

  try {
    pending_branch.value = true

    branchs.value = await getBranchBy({
      match: { company_id, },
      pagination: pagination.value,
      sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'branch_name', order: "ASC" },
    })
  } catch (e) {
    console.log(e)
  }

  pending_branch.value = false
}
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'บริษัท', to: '/company', },
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
          <table class="table-detail" style="min-width: 300px" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 120px"></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-right">รหัสบริษัท :</td>
                <td class="text-muted">{{ company.company_id }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อบริษัท :</td>
                <td class="text-muted">{{ company.company_name }}</td>
              </tr>
              <tr>
                <td class="text-right">โทรศัพท์ :</td>
                <td class="text-muted">{{ company.company_tel }}</td>
              </tr>
              <tr>
                <td class="text-right" style="vertical-align: top;">ที่อยู่ :</td>
                <td class="text-muted">{{ company.company_address }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <v-row class="mt-4">
          <v-col cols="12" md="8">
            <v-label class="mb-2">รายชื่อสาขา</v-label>
            <v-data-table-server :loading="pending_branch" :headers="headers" :items="branchs.docs"
              :items-length="branchs.totalDocs" :items-per-page="pagination.size" :page="pagination.page"
              density="compact" @update:options="(e: any) => {
                pagination.page = e.page
                pagination.size = e.itemsPerPage
                pagination.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ index + 1 }}</template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/company'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>