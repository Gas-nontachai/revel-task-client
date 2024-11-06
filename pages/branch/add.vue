<script lang="ts" setup>
import Swal from "sweetalert2"
import { Branch, Company, User, UserBranch } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { generateBranchID, insertBranch, } = useBranch();
const { getCompanyBy } = useCompany();

const router = useRouter();

const pending = ref(true)
const submitting = ref(false)
const user_dialog = ref<{
  show: boolean,
  user_ids: string[],
}>({
  show: false,
  user_ids: [],
})
const branch = ref<Branch>({
  branch_id: '',
  company_id: '',
  branch_name: '',
  branch_tel: '',
  branch_address: '',
});
const user_branchs = ref<UserBranch[]>([]);
const companys = ref<Company[]>([])

const company_options = computed(() => companys.value.map(item => ({ value: item.company_id, title: item.company_name, })))

onMounted(async () => {
  try {
    branch.value.branch_id = await generateBranchID()

    companys.value = await getCompanyBy({ sorter: { key: 'company_name', order: "ASC" }, }).then(res => res.docs)

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/branch' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await insertBranch({
      branch: branch.value,
      user_branchs: user_branchs.value.map(item => ({
        user_branch_id: item.user_branch_id,
        company_id: item.company_id,
        user_id: item.user_id,
      })),
    });

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/branch' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    branch_id,
    company_id,
    branch_name,
    branch_tel
  } = branch.value

  if (!(branch_id
    && company_id
    && branch_name
    && branch_tel
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  } else if (!user_branchs.value.length) {
    Swal.fire({ text: 'กรุณากรอกรายชื่อผู้ดูแลสาขา', icon: "warning" })
    return false
  }

  return true
}

function onChangeCompany() {
  const { company_id, } = branch.value

  if (company_id) {
    const company = companys.value.find(val => val.company_id === company_id)

    if (company) {
      branch.value.branch_name = company.company_name
    }

    return
  }

  branch.value.branch_name = ''
}

function beginUserSelect() {
  user_dialog.value = {
    show: true,
    user_ids: user_branchs.value.map(item => item.user_id),
  }
}

function onUserSelected(users: User[]) {
  users.forEach(user => {
    user_branchs.value.push({
      user_branch_id: '',
      company_id: '',
      user_id: user.user_id,
      user,
    })
  })

  user_dialog.value.show = false
}

function deleteUserRow(index: number) {
  user_branchs.value.splice(index, 1)
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'สาขา', to: '/branch', },
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
          <v-col cols="12" md="6" lg="3">
            <v-label class="mb-2">รหัสสาขา<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="branch.branch_id" density="compact" :rules="[rules.required]"
              variant="outlined"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-label class="mb-2">บริษัท<span class="text-error ml-1">*</span></v-label>
            <v-autocomplete v-model="branch.company_id" :items="company_options" density="compact" variant="outlined"
              v-on:update:model-value="onChangeCompany"></v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-label class="mb-2">ชื่อสาขา<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="branch.branch_name" :rules="[rules.required]" density="compact"
              variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-label class="mb-2">โทรศัพท์<span class="text-error ml-1">*</span></v-label>
            <v-text-field v-model="branch.branch_tel" density="compact" variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="12" md="9">
            <v-label class="mb-2">ที่อยู่</v-label>
            <v-textarea v-model="branch.branch_address" density="compact" variant="outlined"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="9">
            <v-label class="mb-2">รายชื่อผู้ดูแลสาขา</v-label>
            <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
              <thead>
                <tr>
                  <th scope="#" :style="{ width: '48px' }">#</th>
                  <th scope="UserId" :style="{ width: '240px' }">รหัสผู้ดูแล</th>
                  <th scope="Name">ชื่อ</th>
                  <td :style="{ width: '48px' }"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in user_branchs" :key="index">
                  <td class="align-middle text-center">{{ index + 1 }}</td>
                  <td class="align-middle">{{ item.user_id }}</td>
                  <td>{{ item.user?.user_fullname }}</td>
                  <td class="text-center">
                    <v-icon clickable @click="deleteUserRow(index)" color="error">mdi-trash-can-outline</v-icon>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="text-center" colspan="5">
                    <v-btn color="muted" density="compact" @click="beginUserSelect">เพิ่มรายการ</v-btn>
                  </td>
                </tr>
              </tfoot>
            </table>
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
      <v-btn color="muted" :to="'/branch'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>

  <branch-user-dialog v-model="user_dialog" @selected="onUserSelected" />
</template>