<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";

import errorImage from "@/assets/images/error.png"
import { match } from 'assert';

definePageMeta({ middleware: ["auth"] });

const { getProjectBy, deleteProjectBy } = useProject();

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('project')

const { public: publicCtx } = useRuntimeConfig()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
    { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
    { key: "no", title: "#", sortable: false, width: 40 },
    { key: "project_name", title: "ชื่อโปรเจคต์", width: 300, },
    { key: "project_start_date", title: "กำหนดเริ่ม", width: 100, },
    { key: "project_end_date", title: "กำหนดเเสร็จ", width: 100, },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const search = ref<{
    text: string,
    columns: string[],
    condition: string,
}>({
    text: '',
    columns: [
        "project_id",
        'project_name',
        'project_start_date',
        'project_end_date',
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
    match: {
        project_start_date: {
            $gte: '2024-09-01'
        }
    },
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


</script>

<template>
    <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
        <v-card-title>Projects Manager</v-card-title>
        <v-card-text>
            <v-row class="mb-4">
                <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
                    <form class="d-flex flex-wrap gap-2" :onsubmit="submitSearch">
                        <v-text-field v-model="search.text" label="Search..." append-inner-icon="mdi-magnify"
                            density="compact" variant="outlined" hide-details style="width: 500px"
                            @click:append-inner="refreshProjects()"></v-text-field>
                    </form>
                </v-col>
                <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
                    <template v-if="permission_add">
                        <v-btn elevation="3" color="success" to="/project/add">เพิ่มโปรเจคต์ใหม่</v-btn>
                    </template>
                </v-col>
            </v-row>
            <v-data-table-server :loading="pendingProjects" :headers="headers" :items="projects?.docs ?? []"
                :items-length="projects?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
                density="compact" @update:options="(e: any) => {
                    pagination.page = e.page
                    pagination.size = e.itemsPerPage
                    pagination.sorter = e.sortBy
                }">
                <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
                <template v-slot:item.project_img="{ item }">
                    <v-avatar>
                        <v-img v-if="item.raw.project_img" class="mx-auto"
                            :src="`${publicCtx.apiBaseUrl}${item.raw.project_img}`" width="50px" height="50px" cover
                            alt="Avatar">
                            <template v-slot:error>
                                <v-img class="mx-auto" :src="errorImage" width="50px" height="50px" cover
                                    alt="error"></v-img>
                            </template>
                        </v-img>
                    </v-avatar>
                </template>
                <template v-slot:item.operation="{ item }">
                    <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                            <v-label class="cursor-pointer" icon v-bind="props">
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-label>
                        </template>
                        <v-list>
                            <v-list-item class="cursor-pointer" density="compact"
                                :to="{ path: '/project/detail', query: { id: item.raw.project_id } }">
                                <v-list-item-title>
                                    <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                                </v-list-item-title>
                            </v-list-item>
                            <template v-if="permission_edit">
                                <v-list-item class="cursor-pointer" density="compact"
                                    :to="{ path: '/project/update', query: { id: item.raw.project_id } }">
                                    <v-list-item-title>
                                        <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                                    </v-list-item-title>
                                </v-list-item>
                            </template>
                            <template v-if="permission_delete">
                                <v-list-item class="cursor-pointer" density="compact"
                                    @click="onDelete(item.raw.project_id)">
                                    <v-list-item-title>
                                        <v-icon> mdi-trash-can-outline</v-icon> ลบ
                                    </v-list-item-title>
                                </v-list-item>
                            </template>
                        </v-list>
                    </v-menu>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

</template>