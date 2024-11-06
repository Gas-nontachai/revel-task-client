<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import { User, } from "~~/misc/types"

const emit = defineEmits<{
  selected: [users: User[]]
}>()

const props = defineProps({
  modelValue: {
    type: Object as PropType<{
      show: boolean,
      user_ids: string[],
    }>,
    required: true
  },
})

const { getUserBy } = useUser()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40, align: 'center' },
  { key: "user_id", title: "รหัสพนักงาน", width: 180 },
  { key: "user_fullname", title: "ชื่อ-สกุล", },
];

const pending = ref(true)
const submitting = ref(false)
const pagination = ref({ page: 1, size: 10, sorter: [] })
const user_ids = ref<User[]>([])
const users = ref<{
  docs: User[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
})

watch(props, ({ modelValue }) => {
  if (!modelValue.show) return

  user_ids.value = []
  pagination.value = { page: 1, size: 10, sorter: [] }
}, { flush: 'pre', immediate: true, deep: true })

watch(pagination, () => fetchData(), { flush: 'pre', immediate: true, deep: true })

async function fetchData() {
  try {
    pending.value = true

    users.value = await getUserBy({
      match: { user_id: { $nin: props.modelValue.user_ids } },
      pagination: pagination.value,
      sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'user_firstname', order: "ASC" },
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

    const { docs: users } = await getUserBy({ match: { user_id: { $in: user_ids.value } }, })

    emit('selected', users)
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
        <v-toolbar-title>เลือกพนักงาน</v-toolbar-title>
        <v-btn icon dark @click="modelValue.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="overflow-auto" style="max-height: 80vh;">
        <v-data-table-server :loading="pending" :headers="headers" :items="users.docs" :items-length="users.totalDocs"
          :items-per-page="pagination.size" item-value="user_id" show-select v-model="user_ids" density="compact"
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
          ตกลง ({{ user_ids.length }})
        </v-btn>
        <v-btn color="muted" @click="modelValue.show = false">ยกเลิก</v-btn>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
    </v-card>
  </v-dialog>
</template>