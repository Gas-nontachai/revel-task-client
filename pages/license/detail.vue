<script lang="ts" setup>
import {
  License,
  LicenseNotify,
  Permission,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getLicenseNotifyBy } = useLicenseNotify()
const { getLicenseByID } = useLicense()
const { getPermissionBy } = usePermission()

const router = useRouter();

const group_readonlys = [1]
const menu_group_names = ['ระบบจัดซื้อ', 'รายงาน', 'ข้อมูลหลัก']
const notify_group_names = ['แจ้งเตือนหลัก']

const tab = ref('')
const pending = ref(true)
const license = ref<License>({
  license_id: '',
  license_name: '',
  license_all_branch: false,
})
const notify_groups = ref<{
  group_no: number,
  group_name: string,
  license_notifys: LicenseNotify[],
}[]>([])
const permission_groups = ref<{
  group_no: number,
  group_name: string,
  group_readonly: boolean,
  permissions: Permission[],
}[]>([])

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    license.value = await getLicenseByID({ license_id: query.id })

    const { docs: license_notifys } = await getLicenseNotifyBy({ license_id: query.id })
    const { docs: permissions } = await getPermissionBy({ license_id: query.id })

    permissions.forEach(item => {
      item.permission_view = !!item.permission_view
      item.permission_add = !!item.permission_add
      item.permission_edit = !!item.permission_edit
      item.permission_approve = !!item.permission_approve
      item.permission_delete = !!item.permission_delete

      let permission_group = permission_groups.value.find(val => val.group_no === item.menu_group)

      if (permission_group) {
        permission_group.permissions.push(item)
      } else {
        permission_groups.value.push({
          group_no: item.menu_group,
          group_readonly: group_readonlys.includes(item.menu_group),
          group_name: menu_group_names[item.menu_group],
          permissions: [item],
        })
      }
    })

    license_notifys.forEach(item => {
      item.is_active = !!item.is_active

      let notify_group = notify_groups.value.find(val => val.group_no === item.notify_event_group)

      if (notify_group) {
        notify_group.license_notifys.push(item)
      } else {
        notify_groups.value.push({
          group_no: item.notify_event_group,
          group_name: notify_group_names[item.notify_event_group],
          license_notifys: [item],
        })
      }
    })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/license' });
  }
})
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'สิทธิ์การใช้งาน', to: '/license', },
    { title: 'ดูรายละเอียด', disabled: true, }
  ]">
    <template v-slot:title="{ item }">{{ item.title.toUpperCase() }}</template>
  </v-breadcrumbs>
  <v-card elevation="10" class="pa-4 withbg">
    <v-card-title>ดูรายละเอียด</v-card-title>
    <template v-if="pending">
      <v-card-text class="text-center py-4">
        <v-label>กำลังโหลดข้อมูล..</v-label>
        <v-progress-circular class="ml-4" indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text class="py-4">
        <table class="w-100" aria-describedby="detail">
          <thead>
            <tr>
              <th scope="Title" :style="{ width: '180px' }"></th>
              <th scope="Value"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-right px-2 py-2">สิทธิ์การใช้งาน</td>
              <td class="px-2 py-2">{{ license.license_name }}</td>
            </tr>
            <tr>
              <td class="text-right px-2 py-2">เข้าถึงข้อมูล</td>
              <td class="px-2 py-2">{{ license.license_all_branch ? 'ทุกสาขา' : 'ประจำสาขา' }}</td>
            </tr>
          </tbody>
        </table>

        <v-tabs v-model="tab" bg-color="grey100" color="primary">
          <v-tab value="">สิทธิ์การใช้งาน</v-tab>
          <v-tab value="notify">การแจ้งเตือน</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="">
            <div v-for="group in permission_groups" :key="group.group_no">
              <v-label class="mt-4">{{ group.group_name }}</v-label>
              <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
                <thead>
                  <tr>
                    <th scope="#" :style="{ width: '48px' }">#</th>
                    <th scope="Menu">Menu</th>
                    <th scope="View" :style="{ width: '100px' }">ดู</th>
                    <template v-if="!group.group_readonly">
                      <th scope="Add" :style="{ width: '100px' }">เพิ่ม</th>
                      <th scope="Update" :style="{ width: '100px' }">แก้ไข</th>
                      <th scope="Approve" :style="{ width: '100px' }">อนุมัติ</th>
                      <th scope="Delete" :style="{ width: '100px' }">ลบ</th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in group.permissions" :key="item.menu_id">
                    <td class="align-middle text-center">{{ index + 1 }}</td>
                    <td class="align-middle">{{ item.menu_name_th }}</td>
                    <td class="align-middle text-center">
                      <v-icon color="success" v-if="item.permission_view">mdi-check-bold</v-icon>
                      <v-icon color="error" v-else>mdi-close-thick</v-icon>
                    </td>
                    <template v-if="!group.group_readonly">
                      <td class="align-middle text-center">
                        <v-icon color="success" v-if="item.permission_add">mdi-check-bold</v-icon>
                        <v-icon color="error" v-else>mdi-close-thick</v-icon>
                      </td>
                      <td class="align-middle text-center">
                        <v-icon color="success" v-if="item.permission_edit">mdi-check-bold</v-icon>
                        <v-icon color="error" v-else>mdi-close-thick</v-icon>
                      </td>
                      <td class="align-middle text-center">
                        <v-icon color="success" v-if="item.permission_approve">mdi-check-bold</v-icon>
                        <v-icon color="error" v-else>mdi-close-thick</v-icon>
                      </td>
                      <td class="align-middle text-center">
                        <v-icon color="success" v-if="item.permission_delete">mdi-check-bold</v-icon>
                        <v-icon color="error" v-else>mdi-close-thick</v-icon>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-window-item>
          <v-window-item value="notify">
            <div v-for="group in notify_groups" :key="group.group_no">
              <v-label class="mt-4">{{ group.group_name }}</v-label>
              <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
                <thead>
                  <tr>
                    <th scope="#" :style="{ width: '48px' }">#</th>
                    <th scope="Active" :style="{ width: '48px' }"></th>
                    <th scope="Notify">Notify</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in group.license_notifys" :key="item.notify_event_id">
                    <td class="align-middle text-center">{{ index + 1 }}</td>
                    <td class="align-middle text-center">
                      <v-icon color="success" v-if="item.is_active">mdi-check-bold</v-icon>
                      <v-icon color="error" v-else>mdi-close-thick</v-icon>
                    </td>
                    <td class="align-middle">{{ item.notify_event_name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </template>
    <v-divider class="border-opacity-100"></v-divider>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn color="muted" :to="'/license'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>