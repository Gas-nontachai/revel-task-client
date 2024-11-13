<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { VDataTable } from 'vuetify/labs/components';
import Swal from "sweetalert2";
import { Project, Task } from "~~/misc/types";

import errorImage from "@/assets/images/error.png";

definePageMeta({ middleware: ["auth"] });

const { getProjectBy } = useProject();
const { getTaskByID } = useTask();
const { $auth } = useNuxtApp();
const { permission_add, permission_delete, permission_edit } = $auth.getPermission('project');
const { public: publicCtx } = useRuntimeConfig();

type Headers = InstanceType<typeof VDataTable>['headers'];

const headers = ref<Headers>([]);

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
const tasks = ref<Task[]>([]);

// Complete list of task fields (taskKeys), with 'index' added as the first column
const taskKeys = [
    "index",  // Index column for the row number
    "project_task_name",
    "project_task_date_start",
    "project_task_date_end",
    "project_task_status",
    "project_task_type",
    "user_username",
    "user_firstname",
    "user_lastname",
    "user_email",
    "user_phone",
    "user_address",
    "user_birthday",
    "user_position_id",
    "user_req",
    "user_res",
    "user_status",
    "project_task_id",
    "project_task_module",
    "project_task_platform",
    "project_task_on_system",
    "project_task_progress",
    "project_task_request_by",
    "project_task_response_by",
    "project_task_upload",
    "license_id",
    "member_id",
    "updateby",
    "addby",
    "adddate",
    "lastupdate",
    "project_id",
    "project_task_detail",
    "project_task_md",
    "project_task_task",
    "project_task_date"
];

onMounted(async () => {
    try {
        // Fetch projects
        projects.value = await getProjectBy().then(res => res.docs);
        console.log(projects.value.map(project => ({
            title: project.project_name,
            value: project.project_id
        })));
    } catch (e) {
        console.log(e);
    }
});

// Handle project selection change
const changeValue = async (task_id: string) => {
    try {
        console.log(task_id);

        // Fetch tasks by task_id
        const response = await getTaskByID({ task_id });

        console.log(response);

        if (Array.isArray(response) && response.length > 0) {
            // Dynamically generate headers based on taskKeys
            headers.value = taskKeys.map(key => ({
                key,
                title: formatTitle(key),
                width: 100,
            }));

            // Map the API response to match the task structure dynamically
            tasks.value = response.map((task, index) => {
                const mappedTask: Record<string, any> = {};
                // Add the index to the first column for each task row
                mappedTask["index"] = index + 1;
                taskKeys.forEach(key => {
                    if (key !== "index") {
                        mappedTask[key] = task[key];
                    }
                });
                return mappedTask as Task;
            });

            message.value = '';
        } else {
            // Handle no tasks found
            message.value = 'No tasks found for the specified project.';
            tasks.value = [];
            headers.value = [];
            Swal.fire({
                icon: 'warning',
                title: 'No Tasks Found',
                text: 'There are no tasks associated with this project.',
            });
        }
    } catch (e: any) {
        console.error('Error fetching task:', e.message || e);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to fetch tasks: ${e.message || e}`,
        });
    }
};

// Helper function to format the header titles
const formatTitle = (key: string): string => {
    return key
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (match) => match.toUpperCase()); // Capitalize the first letter of each word
};
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
            <v-data-table :headers="headers" :items="tasks" :pagination.sync="pagination"
                class="elevation-1"></v-data-table>
        </v-card-text>
    </v-card>
</template>
