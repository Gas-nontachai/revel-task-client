<script lang="ts" setup>
import Swal from "sweetalert2"
import { Project } from "~~/misc/types"
import defaultProjectImage from "@/assets/images/default-project.png"
import errorImage from "@/assets/images/error.png"

definePageMeta({ middleware: ["auth"] });

const { getLicenseBy, } = useLicense();

const { generateProjectID, getProjectBy, insertProject, } = useProject();

const { public: publicCtx } = useRuntimeConfig()

const router = useRouter();

const status_options: string[] = ['active', 'inactive'];

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
const projectname_validate = ref<{
    is_valid: boolean,
    error: string,
}>({
    is_valid: false,
    error: '',
})
const buffer_image = ref<{
    project_img: { files?: File[], src: string },
}>({
    project_img: { src: '' },
})
const license_options = ref<{ value: string; title: string; }[]>([])

onMounted(async () => {
    try {
        project.value.project_id = await generateProjectID()

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
        await validateProjectname();

        if (!projectname_validate.value.is_valid) {
            Swal.fire({ text: projectname_validate.value.error, icon: "warning" });
            return;
        }
        submitting.value = true


        await insertProject({
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

async function validateProjectname() {
    try {
        project.value.project_name = project.value.project_name.trim()

        if (!project.value.project_name.length) {
            projectname_validate.value = { is_valid: false, error: "จำเป็นต้องกรอก Projectname", }

            return
        }

        const duplicate = await getProjectBy({ match: { project_name: project.value.project_name } })

        if (duplicate.docs.length) {
            projectname_validate.value = { is_valid: false, error: "ไม่สามารถใช้ Projectname นี้ได้", }

            return
        }

        projectname_validate.value = { is_valid: true, error: "", }
    } catch (e) {
        console.log(e)
    }
}
</script>

<template>
    <v-breadcrumbs :items="[
        { title: 'พนักงาน/ผู้ใช้งาน', to: '/project', },
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
                                <label for="date">
                                    กำหนดเริ่ม:</label>
                                <input type="date" :rules="[rules.required]" v-model="project.project_start_date">
                            </v-col>
                            <v-col cols="12" sm="6" lg="4">
                                <label for="date">กำหนดเสร็จ:</label>
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