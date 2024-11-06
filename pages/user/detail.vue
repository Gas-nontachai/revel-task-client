<script lang="ts" setup>
import { User } from "~~/misc/types"

import defaultUserImage from "@/assets/images/default-user.png"
import errorImage from "@/assets/images/error.png"

definePageMeta({ middleware: ["auth"] });

const { getUserByID } = useUser();

const router = useRouter();

const { public: publicCtx } = useRuntimeConfig()

const pending = ref(false)
const user = ref<User>({
  user_id: '',
  license_id: '',
  user_prefix: '',
  user_firstname: '',
  user_lastname: '',
  user_tel: '',
  user_email: '',
  user_username: '',
  user_password: '',
  user_address: '',
  user_status: '',
  user_img: '',
});

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    user.value = await getUserByID({ user_id: query.id })
  } catch (e) {
    console.log(e)

    await router.push({ path: '/user' });
  }
})
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'พนักงาน/ผู้ใช้งาน', to: '/user', },
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
        <v-row>
          <v-col cols="12" md="8">
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>รหัสพนักงาน</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_id }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>ชื่อ-สกุล</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_firstname + " " + user.user_lastname }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>ที่อยู่</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_address }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>โทรศัพท์</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_tel }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>Email</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_email }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>Username</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.user_username }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>สิทธ์การใช้งาน</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user.license_name }}</v-label>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" lg="2">
                <v-label>สถานะ</v-label>
              </v-col>
              <v-col cols="12" sm="6" lg="2">
                <v-label>{{ user?.user_status }}</v-label>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="3" lg="2">
            <v-row class="align-center">
              <v-label>รูป (ถ้ามี)</v-label>
            </v-row>
            <v-row>
              <v-avatar size="280">
                <v-img :src="`${user.user_img ? `${publicCtx.apiBaseUrl}${user.user_img}` : defaultUserImage}`" cover
                  alt="user">
                  <template v-slot:error>
                    <v-img :src="errorImage" cover alt="error"></v-img>
                  </template>
                </v-img>
              </v-avatar>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/user'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>