<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";

import errorImage from "@/assets/images/error.png"
import { log } from 'console';

definePageMeta({ middleware: ["auth"] });

const { getProjectBy, deleteProjectBy } = useProject();

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('project')

const { public: publicCtx } = useRuntimeConfig()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
    { key: "no", title: "#", sortable: false, width: 40 },
    { key: "test", title: "วันที่รับเรื่อง", width: 100, },
    { key: "test2", title: "ระบบที่เกี่ยวข้อง", width: 100, },
    { key: "test3", title: "หัวข้อ", width: 100, },
    { key: "test4", title: "ผู้ร้องขอ", width: 100, },
    { key: "test5", title: "ผู้รับผิดชอบ", width: 100, },
    { key: "test6", title: "กำหนดเริ่ม", width: 100, },
    { key: "test7", title: "กำหนดเสร็จ", width: 100, },
    { key: "test8", title: "สถานะ", width: 100, },
    { key: "test9", title: "ความคืบหน้า", width: 100, },
    { key: "action", title: " ", width: 100, },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const search = ref<{
    text: string,
    columns: string[],
    condition: string,
}>({
    text: '',
    columns: [
        // "project_id",
        // 'project_name',
        // 'project_start_date',
        // 'project_end_date',
    ],
    condition: 'LIKE',
});

const submitting = ref(false)
const project_id = ref('')


const {
    data: projects,
    pending: pendingProjects,
    refresh: refreshProjects,
} = await useAsyncData('projects', () => getProjectBy({
    pagination: pagination.value,
    search: search.value,
    sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'project_name', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

async function onSubmit() {
    if (submitting.value) return

    submitting.value = false
}

const onDelete = (id: string) => Swal.fire({
    title: "ยืนยันการลบรายการ",
    text: "คุณแน่ใจหรือว่าต้องการลบ ?",
    icon: "warning",
    showCancelButton: true,
}).then(async ({ value }) => {
    try {
        if (!value) return

        await deleteProjectBy({ project_id: id })

        await refreshProjects()

        Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
    } catch (e) {
        console.log(e)
    }
})

function submitSearch(e: FormDataEvent) {
    e.preventDefault()

    refreshProjects()
}

console.log($auth);


</script>

<template>
    <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
        <v-card-title>Projects Manager</v-card-title>
        <v-card-text>
            <v-row class="mb-4">
                <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
                    <v-select label="Select"
                        :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
                        variant="solo-inverted"></v-select>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

</template>