<script lang="ts" setup>
import Swal from "sweetalert2"
import {
  License,
  LicenseNotify,
  Permission,
} from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const router = useRouter();

const { getLicenseNotifyBy } = useLicenseNotify()
const { insertLicense } = useLicense()
const { getPermissionBy } = usePermission()

const group_readonlys = [1]
const menu_group_names = ['ระบบจัดซื้อ', 'รายงาน', 'ข้อมูลหลัก']
const notify_group_names = ['แจ้งเตือนหลัก']

const tab = ref('')
const pending = ref(true)
const submitting = ref(false)
const license = ref<License>({
  license_id: '',
  license_name: '',
  license_all_branch: false,
});
const notify_groups = ref<{
  group_no: number,
  group_name: string,
  all_email_active: boolean,
  all_notify_active: boolean,
  license_notifys: LicenseNotify[],
}[]>([]);
const permission_groups = ref<{
  group_no: number,
  group_name: string,
  group_readonly: boolean,
  group_view: boolean,
  group_add: boolean,
  group_edit: boolean,
  group_approve: boolean,
  group_delete: boolean,
  permissions: Permission[],
}[]>([]);

onMounted(async () => {
  try {
    const { docs: license_notifys } = await getLicenseNotifyBy()
    const { docs: permissions } = await getPermissionBy()

    permissions.forEach(item => {
      let permission_group = permission_groups.value.find(val => val.group_no === item.menu_group)

      if (permission_group) {
        permission_group.permissions.push(item)
      } else {
        permission_groups.value.push({
          group_no: item.menu_group,
          group_readonly: group_readonlys.includes(item.menu_group),
          group_view: false,
          group_add: false,
          group_edit: false,
          group_approve: false,
          group_delete: false,
          group_name: menu_group_names[item.menu_group],
          permissions: [item],
        })
      }
    })

    license_notifys.forEach(item => {
      item.is_email_active = !!item.is_email_active
      item.is_notify_active = !!item.is_notify_active

      let notify_group = notify_groups.value.find(val => val.group_no === item.notify_event_group)

      if (notify_group) {
        notify_group.license_notifys.push(item)
      } else {
        notify_groups.value.push({
          group_no: item.notify_event_group,
          all_email_active: false,
          all_notify_active: false,
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

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    const license_notifys: LicenseNotify[] = []
    const permissions: Permission[] = []

    notify_groups.value.forEach(item => {
      license_notifys.push(...item.license_notifys)
    })

    permission_groups.value.forEach(item => {
      permissions.push(...item.permissions)
    })

    await insertLicense({
      license: license.value,
      license_notifys,
      permissions
    });

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/license' });
  } catch (e) {
    console.log(e)
  }

  submitting.value = false
}

function validateForm(): boolean {
  if (!license.value.license_name) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}

function checkedViewAll(index: number, e: boolean) {
  if (!e) {
    permission_groups.value[index].group_add = false
    permission_groups.value[index].group_edit = false
    permission_groups.value[index].group_approve = false
    permission_groups.value[index].group_delete = false
  }

  permission_groups.value[index].permissions.forEach(item => {
    item.permission_view = e

    if (!e) {
      item.permission_add = false
      item.permission_edit = false
      item.permission_approve = false
      item.permission_delete = false
    }
  })
}

function checkedAll(gidx: number, checked: boolean, type: 'add' | 'edit' | 'approve' | 'delete') {
  permission_groups.value[gidx].permissions.forEach(item => {
    if (checked) item.permission_view = true

    if (type == 'add') item.permission_add = checked
    else if (type == 'edit') item.permission_edit = checked
    else if (type == 'approve') item.permission_approve = checked
    else if (type == 'delete') item.permission_delete = checked
  })
}

function checkedItem(gidx: number, idx: number, checked: boolean, type: 'view' | 'add' | 'edit' | 'approve' | 'delete') {
  if (type === "view") {
    permission_groups.value[gidx].permissions[idx].permission_view = checked

    if (!checked) {
      permission_groups.value[gidx].permissions[idx].permission_add = false
      permission_groups.value[gidx].permissions[idx].permission_edit = false
      permission_groups.value[gidx].permissions[idx].permission_approve = false
      permission_groups.value[gidx].permissions[idx].permission_delete = false
    }
  } else {
    if (checked) permission_groups.value[gidx].permissions[idx].permission_view = true

    if (type === "add") {
      permission_groups.value[gidx].permissions[idx].permission_add = checked
    } else if (type === "edit") {
      permission_groups.value[gidx].permissions[idx].permission_edit = checked
    } else if (type === "approve") {
      permission_groups.value[gidx].permissions[idx].permission_approve = checked
    } else if (type === "delete") {
      permission_groups.value[gidx].permissions[idx].permission_delete = checked
    }
  }

  const { permissions } = permission_groups.value[gidx]

  permission_groups.value[gidx].group_view = permissions.length == permissions.filter(val => val.permission_view).length
  permission_groups.value[gidx].group_add = permissions.length == permissions.filter(val => val.permission_add).length
  permission_groups.value[gidx].group_edit = permissions.length == permissions.filter(val => val.permission_edit).length
  permission_groups.value[gidx].group_approve = permissions.length == permissions.filter(val => val.permission_approve).length
  permission_groups.value[gidx].group_delete = permissions.length == permissions.filter(val => val.permission_delete).length
}

function checkedEmailActiveAll(gidx: number, checked: boolean) {
  notify_groups.value[gidx].license_notifys.forEach(item => {
    item.is_email_active = checked
  })
}

function checkedNotifyActiveAll(gidx: number, checked: boolean) {
  notify_groups.value[gidx].license_notifys.forEach(item => {
    item.is_notify_active = checked
  })
}

function checkedEmailActiveItem(gidx: number) {
  const { license_notifys } = notify_groups.value[gidx]

  notify_groups.value[gidx].all_email_active = license_notifys.length == license_notifys.filter(val => val.is_email_active).length
}

function checkedNotifyActiveItem(gidx: number) {
  const { license_notifys } = notify_groups.value[gidx]

  notify_groups.value[gidx].all_notify_active = license_notifys.length == license_notifys.filter(val => val.is_notify_active).length
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'สิทธิ์การใช้งาน', to: '/license', },
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
          <v-col md="3">
            <v-label class="mb-2">ชื่อสิทธิ์การใช้งาน<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="license.license_name" density="compact" variant="outlined"
              :rules="[rules.required]"></v-text-field>
          </v-col>
          <v-col md="3">
            <div class="d-flex align-center h-100">
              <v-checkbox v-model="license.license_all_branch" color="primary" hide-details>
                <template v-slot:label class="text-body-1">เห็นข้อมูลทุกสาขา</template>
              </v-checkbox>
            </div>
          </v-col>
        </v-row>

        <v-tabs v-model="tab" bg-color="grey100" color="primary">
          <v-tab value="">สิทธิ์การใช้งาน</v-tab>
          <v-tab value="notify">การแจ้งเตือน</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="">
            <div v-for="(group, gidx) in permission_groups" :key="group.group_no">
              <v-label class="mt-4">{{ group.group_name }}</v-label>
              <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
                <thead>
                  <tr>
                    <th scope="#" :style="{ width: '48px' }">#</th>
                    <th scope="Menu">Menu</th>
                    <th class="py-0" scope="View" :style="{ width: '100px' }">
                      <v-checkbox v-model="group.group_view" label="ดู" color="primary" density="compact" hide-details
                        v-on:update:model-value="(e: any) => checkedViewAll(gidx, e)"></v-checkbox>
                    </th>
                    <template v-if="!group.group_readonly">
                      <th class="py-0" scope="Add" :style="{ width: '100px' }">
                        <v-checkbox v-model="group.group_add" label="เพิ่ม" color="primary" density="compact"
                          hide-details v-on:update:model-value="(e: any) => checkedAll(gidx, e, 'add')"></v-checkbox>
                      </th>
                      <th class="py-0" scope="Update" :style="{ width: '100px' }">
                        <v-checkbox v-model="group.group_edit" label="แก้ไข" color="primary" density="compact"
                          hide-details v-on:update:model-value="(e: any) => checkedAll(gidx, e, 'edit')"></v-checkbox>
                      </th>
                      <th class="py-0" scope="Approve" :style="{ width: '100px' }">
                        <v-checkbox v-model="group.group_approve" label="อนุมัติ" color="warning" density="compact"
                          hide-details
                          v-on:update:model-value="(e: any) => checkedAll(gidx, e, 'approve')"></v-checkbox>
                      </th>
                      <th class="py-0" scope="Delete" :style="{ width: '100px' }">
                        <v-checkbox v-model="group.group_delete" label="ลบ" color="error" density="compact" hide-details
                          v-on:update:model-value="(e: any) => checkedAll(gidx, e, 'delete')"></v-checkbox>
                      </th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in group.permissions" :key="item.menu_id">
                    <td class="align-middle text-center">{{ index + 1 }}</td>
                    <td class="align-middle">{{ item.menu_name_th }}</td>
                    <td class="text-center py-0">
                      <v-checkbox v-model="item.permission_view" color="primary" density="compact" hide-details
                        v-on:update:model-value="(e: any) => checkedItem(gidx, index, e, 'view')"></v-checkbox>
                    </td>
                    <template v-if="!group.group_readonly">
                      <td class="text-center py-0">
                        <v-checkbox v-model="item.permission_add" color="primary" density="compact" hide-details
                          v-on:update:model-value="(e: any) => checkedItem(gidx, index, e, 'add')"></v-checkbox>
                      </td>
                      <td class="text-center py-0">
                        <v-checkbox v-model="item.permission_edit" color="primary" density="compact" hide-details
                          v-on:update:model-value="(e: any) => checkedItem(gidx, index, e, 'edit')"></v-checkbox>
                      </td>
                      <td class="text-center py-0">
                        <v-checkbox v-model="item.permission_approve" color="warning" density="compact" hide-details
                          v-on:update:model-value="(e: any) => checkedItem(gidx, index, e, 'approve')"></v-checkbox>
                      </td>
                      <td class="text-center py-0">
                        <v-checkbox v-model="item.permission_delete" color="error" density="compact" hide-details
                          v-on:update:model-value="(e: any) => checkedItem(gidx, index, e, 'delete')"></v-checkbox>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-window-item>
          <v-window-item value="notify">
            <div v-for="(group, gidx) in notify_groups" :key="group.group_no">
              <v-label class="mt-4">{{ group.group_name }}</v-label>
              <table class="table table-bordered table-striped mt-2" aria-describedby="notify">
                <thead>
                  <tr>
                    <th scope="#" :style="{ width: '48px' }">#</th>
                    <th class="py-0" scope="Active" :style="{ width: '48px' }">
                      <v-checkbox v-model="group.all_notify_active" color="primary" density="compact" hide-details
                        v-on:update:model-value="(e: any) => checkedNotifyActiveAll(gidx, e)"></v-checkbox>
                    </th>
                    <th class="py-0" scope="Active" :style="{ width: '48px' }">
                      <v-checkbox v-model="group.all_email_active" color="primary" density="compact" hide-details
                        v-on:update:model-value="(e: any) => checkedEmailActiveAll(gidx, e)"></v-checkbox>
                    </th>
                    <th scope="Notify">Notify</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in group.license_notifys" :key="item.notify_event_id">
                    <td class="align-middle text-center">{{ index + 1 }}</td>
                    <td class="text-center py-0">
                      <v-checkbox v-model="item.is_notify_active" color="primary" density="compact" hide-details
                        v-on:update:model-value="() => checkedNotifyActiveItem(gidx)"></v-checkbox>
                    </td>
                    <td class="text-center py-0">
                      <v-checkbox v-model="item.is_email_active" color="primary" density="compact" hide-details
                        v-on:update:model-value="() => checkedEmailActiveItem(gidx)"></v-checkbox>
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
    <v-card-text class="d-flex justify-center gap-2">
      <v-btn color="save" @click="onSubmit">
        <template v-if="submitting">
          <v-progress-circular class="mr-2" indeterminate color="success" :size="16"></v-progress-circular>
        </template> บันทึก
      </v-btn>
      <v-btn color="muted" :to="'/license'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>
</template>