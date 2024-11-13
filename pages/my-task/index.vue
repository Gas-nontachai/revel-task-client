<script lang="ts" setup>
import { ref } from 'vue';
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";
import { Project } from "~~/misc/types"

import errorImage from "@/assets/images/error.png"
import { log } from 'console';
import { title } from 'process';

definePageMeta({ middleware: ["auth"] });

const { getProjectBy } = useProject();
const { getTaskByID } = useTask();
const { $auth } = useNuxtApp();
const { permission_add, permission_delete, permission_edit } = $auth.getPermission('project');
const { public: publicCtx } = useRuntimeConfig();

type Headers = InstanceType<typeof VDataTable>['headers'];

const headers: Headers = [];

const pagination = ref({ page: 1, size: 20, sorter: [] });
const search = ref({
    text: '',
    columns: [],
    condition: 'LIKE',
});

const submitting = ref(false);
const project_id = ref('');
const selectedProject = ref<string>('');

const message = ref('Select something');

const projects = ref<Project[]>([]);

onMounted(async () => {
    try {
        projects.value = await getProjectBy().then(res => res.docs)
        console.log(projects.value.map(project => ({
            title: project.project_name,
            value: project.project_id
        })));
    } catch (e) {
        console.log(e)
    }
})

const changeValue = async (task_id: string) => {
    try {
        console.log('Task ID:', task_id);

        const response = await getTaskByID({ task_id });
        console.log(response);

        if (!response || (Array.isArray(response) && response.length === 0)) {
            message.value = 'No task found for the specified task.';
        } else {
            message.value = 'Task found';
        }
    } catch (e: any) {
        console.error('Error fetching task:', e.message || e);
    }
}


</script>
<template>
    <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
        <v-card-title>Projects Manager</v-card-title>
        <v-card-text>

            <v-row class="mb-4">
                <v-col class="d-flex flex-wrap gap-2 align-center py-2" cols="12" md="8">
                    <v-select label="Select Project" :items="projects.map(project => ({
                        title: project.project_name,
                        value: project.project_id
                    }))" v-model="selectedProject" @update:model-value="changeValue"
                        variant="solo-inverted"></v-select>
                </v-col>
            </v-row>
            <div>
                <h3>{{ message }}</h3>
            </div>
        </v-card-text>
    </v-card>

</template>
