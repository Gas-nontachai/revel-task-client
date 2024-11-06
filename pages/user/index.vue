<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import Swal from "sweetalert2";

import errorImage from "@/assets/images/error.png"

definePageMeta({ middleware: ["auth"] });

const { getUserBy, updatePasswordUserBy, deleteUserBy } = useUser();

const { $auth } = useNuxtApp()

const { permission_add, permission_delete, permission_edit, } = $auth.getPermission('user')

const { public: publicCtx } = useRuntimeConfig()

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "operation", title: "...", sortable: false, width: 50, align: 'center' },
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "user_id", title: "รหัสพนักงาน", width: 160, },
  { key: "user_fullname", title: "ชื่อ-สกุล", },
  { key: "user_email", title: "Email", width: 200, },
  { key: "user_tel", title: "โทรศัพท์", width: 150, },
  { key: "user_username", title: "Username", width: 150, },
  { key: "license_name", title: "สิทธ์การใช้งาน", sortable: false, width: 150, align: 'center' },
  { key: "user_status", title: "สถานะ", sortable: false, width: 80, align: 'center' },
];

const pagination = ref({ page: 1, size: 20, sorter: [], })
const search = ref<{
  text: string,
  columns: string[],
  condition: string,
}>({
  text: '',
  columns: [
    "user_id",
    'user_firstname',
    'user_lastname',
    'user_username',
  ],
  condition: 'LIKE',
});

const submitting = ref(false)
const new_password = ref('')
const confirm_password = ref('')
const user_id = ref('')
const password_dialog = ref(false);

const {
  data: users,
  pending: pendingUsers,
  refresh: refreshUsers,
} = await useAsyncData('users', () => getUserBy({
  pagination: pagination.value,
  search: search.value,
  sorter: pagination.value.sorter.length ? pagination.value.sorter : { key: 'user_firstname', order: "ASC" },
}), { immediate: false, watch: [pagination.value] })

async function onSubmit() {
  if (submitting.value || !validatePassword()) return

  try {
    submitting.value = true

    const { error } = await updatePasswordUserBy({
      user_id: user_id.value,
      new_password: new_password.value,
    });

    if (error) {
      Swal.fire({ title: 'ผิดพลาด', text: error.message, icon: "error" })
    } else {
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })

      closeDialog()
    }
  } catch (e) {
    console.log(e)
  }

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

    await deleteUserBy({ user_id: id })

    await refreshUsers()

    Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลแล้ว', icon: "success" })
  } catch (e) {
    console.log(e)
  }
})

function validatePassword(): boolean {
  if (pwdRule(new_password.value) !== true) return false
  if (pwdRule(confirm_password.value) !== true && isConfirmMatch() !== true) return false

  return true
}

const pwdRule = (pwd: string) => {
  pwd = pwd.trim()

  const isPassword = /^[\da-zA-Z@#]+$/.test(pwd)

  if (pwd.length == 0) return 'Required.'
  if (pwd.length < 6 || pwd.length > 30) return 'Password must 6 to 30 characters.'
  if (!isPassword) return 'Invalid password format.'

  return true
}

const isConfirmMatch = () => {
  return new_password.value === confirm_password.value ? true : 'Passwords do not match'
};

const closeDialog = () => {
  password_dialog.value = false
  new_password.value = ''
  confirm_password.value = ''
}

function submitSearch(e: FormDataEvent) {
  e.preventDefault()

  refreshUsers()
}

const modalPassword = (id: string) => {
  new_password.value = ''
  confirm_password.value = ''
  password_dialog.value = true
  user_id.value = id
};
</script>

<template>
  <v-card elevation="10" class="pa-4 withbg" color="grey-lighten-3">
    <v-card-title>พนักงาน/ผู้ใช้งาน</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col class="d-flex flex-wrap gap-2 align-center  py-2" cols="12" md="8">
          <form class="d-flex flex-wrap gap-2" :onsubmit="submitSearch">
            <v-text-field v-model="search.text" label="Search..." append-inner-icon="mdi-magnify" density="compact"
              variant="outlined" hide-details style="width: 500px" @click:append-inner="refreshUsers()"></v-text-field>
          </form>
        </v-col>
        <v-col class="d-flex flex-wrap gap-2 align-center justify-md-end py-2" cols="12" md="4">
          <template v-if="permission_add">
            <v-btn elevation="3" color="success" to="/user/add">เพิ่มรายการใหม่</v-btn>
          </template>
        </v-col>
      </v-row>
      <v-data-table-server :loading="pendingUsers" :headers="headers" :items="users?.docs ?? []"
        :items-length="users?.totalDocs ?? 0" :items-per-page="pagination.size" :page="pagination.page"
        density="compact" @update:options="(e: any) => {
          pagination.page = e.page
          pagination.size = e.itemsPerPage
          pagination.sorter = e.sortBy
        }">
        <template v-slot:item.no="{ index }">{{ pageItemNo(pagination, index) }}</template>
        <template v-slot:item.user_img="{ item }">
          <v-avatar>
            <v-img v-if="item.raw.user_img" class="mx-auto" :src="`${publicCtx.apiBaseUrl}${item.raw.user_img}`"
              width="50px" height="50px" cover alt="Avatar">
              <template v-slot:error>
                <v-img class="mx-auto" :src="errorImage" width="50px" height="50px" cover alt="error"></v-img>
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
                :to="{ path: '/user/detail', query: { id: item.raw.user_id } }">
                <v-list-item-title>
                  <v-icon> mdi-chat-processing-outline</v-icon> ดูรายละเอียด
                </v-list-item-title>
              </v-list-item>
              <template v-if="permission_edit">
                <v-list-item class="cursor-pointer" density="compact" @click="modalPassword(item.raw.user_id)">
                  <v-list-item-title>
                    <v-icon> mdi-key-variant</v-icon> เปลี่ยนรหัสผ่าน
                  </v-list-item-title>
                </v-list-item>
                <v-list-item class="cursor-pointer" density="compact"
                  :to="{ path: '/user/update', query: { id: item.raw.user_id } }">
                  <v-list-item-title>
                    <v-icon> mdi-square-edit-outline</v-icon> แก้ไข
                  </v-list-item-title>
                </v-list-item>
              </template>
              <template v-if="permission_delete">
                <v-list-item class="cursor-pointer" density="compact" @click="onDelete(item.raw.user_id)">
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

  <v-dialog v-model="password_dialog" max-width="500" :persistent="true">
    <v-card>
      <v-toolbar color="muted">
        <v-toolbar-title>Change password</v-toolbar-title>
        <v-btn icon dark @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col class="text-md-right pt-2" cols="12" md="5">
            <v-label>New password</v-label>
          </v-col>
          <v-col cols="12" md="7">
            <v-text-field v-model="new_password" type="password" density="compact" variant="outlined"
              :rules="[pwdRule]"></v-text-field>
          </v-col>
          <v-col class="text-md-right pt-2" cols="12" md="5">
            <v-label>Confirm password</v-label>
          </v-col>
          <v-col cols="12" md="7">
            <v-text-field v-model="confirm_password" type="password" :rules="[pwdRule, isConfirmMatch]"
              density="compact" variant="outlined"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider class="border-opacity-100"></v-divider>
      <v-card-text class="d-flex justify-center gap-2 py-4">
        <v-btn color="save" @click="onSubmit">
          <template v-if="submitting">
            <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
          </template> บันทึก
        </v-btn>
        <v-btn color="secondary" @click="closeDialog">ยกเลิก</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>