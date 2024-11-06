<script lang="ts" setup>
import Swal from "sweetalert2"
import { BookBankBranch, BookBank, Branch } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getBankBy } = useBank();
const { generateBookBankID, insertBookBank, } = useBookBank();
const { getBranchBy } = useBranch();

const router = useRouter();

const pending = ref(true)
const submitting = ref(false)
const branch_dialog = ref<{
  show: boolean,
  branch_ids: string[],
}>({
  show: false,
  branch_ids: [],
})
const book_bank = ref<BookBank>({
  book_bank_id: '',
  bank_id: '',
  book_bank_number: '',
  book_bank_name: '',
  book_bank_detail: '',
  bank_name: '',
});
const book_bank_branchs = ref<BookBankBranch[]>([]);

const bank_options = ref<{ value: string; title: string; }[]>([])
const branch_options = ref<{ value: string; title: string; }[]>([])

onMounted(async () => {
  try {
    book_bank.value.book_bank_id = await generateBookBankID()

    const { docs: banks } = await getBankBy({ sorter: { key: 'bank_name', order: "ASC" }, })
    const { docs: branchs } = await getBranchBy({ sorter: { key: 'branch_name', order: "ASC" }, })

    bank_options.value = banks.map(item => ({ value: item.bank_id, title: item.bank_name, }))
    branch_options.value = branchs.map(item => ({ value: item.branch_id, title: item.branch_name, }))

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/book-bank' });
  }
})

async function onSubmit() {
  if (pending.value || submitting.value || !validateForm()) return

  try {
    submitting.value = true

    await insertBookBank({
      book_bank: book_bank.value,
      book_bank_branchs: book_bank_branchs.value.map(item => ({
        book_bank_branch_id: item.book_bank_branch_id,
        book_bank_id: item.book_bank_id,
        branch_id: item.branch_id,
      })),
    });

    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลแล้ว', icon: "success" })
    await router.push({ path: '/book-bank' });
  } catch (e) {
    console.log(e)

    submitting.value = false
  }
}

function validateForm(): boolean {
  const {
    book_bank_id,
    bank_id,
    book_bank_number,
    book_bank_name,
  } = book_bank.value

  if (!(book_bank_id
    && bank_id
    && book_bank_number
    && book_bank_name
  )) {
    Swal.fire({ text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: "warning" })
    return false
  }

  return true
}

function beginBranchSelect() {
  branch_dialog.value = {
    show: true,
    branch_ids: book_bank_branchs.value.map(item => item.branch_id),
  }
}

function onBranchSelected(branchs: Branch[]) {
  branchs.forEach(branch => {
    book_bank_branchs.value.push({
      book_bank_branch_id: '',
      book_bank_id: '',
      branch_id: branch.branch_id,
      branch,
    })
  })

  branch_dialog.value.show = false
}

function deleteBranchRow(index: number) {
  book_bank_branchs.value.splice(index, 1)
}
</script>

<template>
  <v-breadcrumbs :items="[
    { title: 'สมุดบัญชี', to: '/book-bank', },
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
              <v-col cols="12" sm="6">
                <v-label class="mb-2">รหัสบัญชี<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="book_bank.book_bank_id" density="compact" :rules="[rules.required]"
                  variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-label class="mb-2">เลขที่บัญชี<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="book_bank.book_bank_number" :rules="[rules.required]" density="compact"
                  variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-label class="mb-2">ชื่อบัญชี<span class="text-error ml-1">*</span></v-label>
                <v-text-field v-model="book_bank.book_bank_name" :rules="[rules.required]" density="compact"
                  variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-label class="mb-2">ธนาคาร<span class="text-error ml-1">*</span></v-label>
                <v-autocomplete v-model="book_bank.bank_id" :items="bank_options" :rules="[rules.required]"
                  density="compact" variant="outlined"></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-label class="mb-2">รายละอียด</v-label>
                <v-textarea v-model="book_bank.book_bank_detail" density="compact" variant="outlined"></v-textarea>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="9">
            <v-label class="mb-2">รายชื่อสาขา</v-label>
            <table class="table table-bordered table-striped mt-2" aria-describedby="schedule">
              <thead>
                <tr>
                  <th scope="#" :style="{ width: '48px' }">#</th>
                  <th scope="BranchId" :style="{ width: '140px' }">รหัสสาขา</th>
                  <th scope="CompanyName">บริษัท</th>
                  <th scope="BranchName">สาขา</th>
                  <td :style="{ width: '48px' }"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in book_bank_branchs" :key="index">
                  <td class="align-middle text-center">{{ index + 1 }}</td>
                  <td class="align-middle">{{ item.branch_id }}</td>
                  <td>{{ item.branch?.company_name }}</td>
                  <td>{{ item.branch?.branch_name }}</td>
                  <td class="text-center">
                    <v-icon clickable @click="deleteBranchRow(index)" color="error">mdi-trash-can-outline</v-icon>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="text-center" colspan="5">
                    <v-btn color="muted" density="compact" @click="beginBranchSelect">เพิ่มรายการ</v-btn>
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
      <v-btn color="muted" :to="'/book-bank'">ยกเลิก</v-btn>
    </v-card-text>
  </v-card>

  <book-bank-branch-dialog v-model="branch_dialog" @selected="onBranchSelected" />
</template>