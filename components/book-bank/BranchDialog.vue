<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import { Branch, } from "~~/misc/types"

const emit = defineEmits<{
  selected: [branchs: Branch[]]
}>()

const props = defineProps({
  modelValue: {
    type: Object as PropType<{
      show: boolean,
      branch_ids: string[],
    }>,
    required: true
  },
})

const { getBranchBy } = useBranch()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "branch_id", title: "รหัสสาขา", width: 160, },
  { key: "branch_name", title: "สาขา", },
  { key: "company_name", title: "บริษัท", },
];

const pending = ref(true)
const submitting = ref(false)
const pagination = ref({ page: 1, size: 10, sorter: [] })
const branch_ids = ref<Branch[]>([])
const branchs = ref<{
  docs: Branch[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
})

watch(props, ({ modelValue }) => {
  if (!modelValue.show) return

  branch_ids.value = []
  pagination.value = { page: 1, size: 10, sorter: [] }
}, { flush: 'pre', immediate: true, deep: true })

watch(pagination, () => fetchData(), { flush: 'pre', immediate: true, deep: true })

async function fetchData() {
  try {
    pending.value = true

    branchs.value = await getBranchBy({
      match: { branch_id: { $nin: props.modelValue.branch_ids } },
      pagination: pagination.value,
      sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'branch_name', order: "ASC" },
    })
  } catch (e) {
    console.log(e)
  }

  pending.value = false
}

async function onConfirmSelect() {
  if (submitting.value) return

  try {
    submitting.value = true

    const { docs: branchs } = await getBranchBy({ match: { branch_id: { $in: branch_ids.value } }, })

    emit('selected', branchs)
  } catch (e) {
    console.log(e)
  }

  submitting.value = false
}
</script>

<template>
  <v-dialog v-model="modelValue.show" max-width="900" :persistent="true">
    <v-card>
      <v-toolbar color="success">
        <v-toolbar-title>เลือกสาขา</v-toolbar-title>
        <v-btn icon dark @click="modelValue.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="overflow-auto" style="max-height: 80vh;">
        <v-data-table-server :loading="pending" :headers="headers" :items="branchs.docs"
          :items-length="branchs.totalDocs" item-value="branch_id" show-select v-model="branch_ids" density="compact"
          @update:options="(e: any) => {
            pagination.page = e.page
            pagination.size = e.itemsPerPage
            pagination.sorter = e.sortBy
          }">
          <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
        </v-data-table-server>
      </v-card-text>
      <v-card-text class="d-flex flex-wrap justify-center gap-2 mb-2">
        <v-btn color="primary" @click="onConfirmSelect">
          <template v-if="submitting">
            <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
          </template>
          ตกลง ({{ branch_ids.length }})
        </v-btn>
        <v-btn color="muted" @click="modelValue.show = false">ยกเลิก</v-btn>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
    </v-card>
  </v-dialog>
</template>