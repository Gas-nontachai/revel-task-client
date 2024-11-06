<script setup lang="ts">
import Swal from "sweetalert2"
import { LockIcon } from 'vue-tabler-icons'
import defaultUserImage from "@/assets/images/default-user.png"

const { public: publicCtx } = useRuntimeConfig()

const { $auth } = useNuxtApp();

const { changePassword, } = useAuth();

const submitting = ref(false)
const password_dialog = ref(false);
const current_password = ref('')
const new_password = ref('')
const confirm_password = ref('')

async function onSubmit() {
  try {
    if (submitting.value || !validatePassword()) return
    submitting.value = true

    const { error } = await changePassword({
      current_password: current_password.value,
      new_password: new_password.value,
    });

    if (error) {
      Swal.fire({ title: 'ผิดพลาด', text: error.message, icon: "error" })
    } else {
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })

      closeDialog()
    }

    submitting.value = false
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validatePassword(): boolean {
  if (pwdRule(current_password.value) !== true) return false
  if (pwdRule(new_password.value) !== true && isNotDuplicated() !== true) return false
  if (pwdRule(confirm_password.value) !== true && isConfirmMatch() !== true) return false

  return true
}

const pwdRule = (pwd: string) => {
  pwd = pwd.trim()

  const isPassword = /^[\da-zA-Z@#]+$/.test(pwd)

  if (pwd.length == 0) return 'Required.'
  if (pwd.length < 6 || pwd.length > 30) return 'Password must 8 to 30 characters.'
  if (!isPassword) return 'Invalid password format.'

  return true
}

const isNotDuplicated = () => {
  return new_password.value !== current_password.value ? true : 'Should not be same as old password'
};

const isConfirmMatch = () => {
  return new_password.value === confirm_password.value ? true : 'Passwords do not match'
};

const closeDialog = () => {
  password_dialog.value = false
  current_password.value = ''
  new_password.value = ''
  confirm_password.value = ''
}
</script>

<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn class="profileBtn custom-hover-primary" variant="text" v-bind="props" icon>
        <v-avatar size="35">
          <v-img :src="`${publicCtx.apiBaseUrl}${$auth.profile?.user_img}`" cover height="35" alt="user">
            <template v-slot:error>
              <v-img cover :src="defaultUserImage"></v-img>
            </template>
          </v-img>
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="200" elevation="10" class="mt-2">
      <v-list class="py-0" lines="one" density="compact">
        <v-list-item value="item1" color="primary" @click="password_dialog = true">
          <template v-slot:prepend>
            <LockIcon size="20" />
          </template>
          <v-list-item-title class="pl-4 text-body-1">Change Password</v-list-item-title>
        </v-list-item>
      </v-list>
      <div class="d-flex py-4 px-5">
        <v-btn color="primary" variant="outlined" block @click="$auth.logout">Logout</v-btn>
      </div>
    </v-sheet>
  </v-menu>

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
            <v-label>Current password</v-label>
          </v-col>
          <v-col cols="12" md="7">
            <v-text-field v-model="current_password" density="compact" variant="outlined"
              :rules="[pwdRule]"></v-text-field>
          </v-col>
          <v-col class="text-md-right pt-2" cols="12" md="5">
            <v-label>New password</v-label>
          </v-col>
          <v-col cols="12" md="7">
            <v-text-field v-model="new_password" density="compact" variant="outlined"
              :rules="[pwdRule, isNotDuplicated]"></v-text-field>
          </v-col>
          <v-col class="text-md-right pt-2" cols="12" md="5">
            <v-label>Confirm password</v-label>
          </v-col>
          <v-col cols="12" md="7">
            <v-text-field v-model="confirm_password" :rules="[pwdRule, isConfirmMatch]" density="compact"
              variant="outlined"></v-text-field>
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
