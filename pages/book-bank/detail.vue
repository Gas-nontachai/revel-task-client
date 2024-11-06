<script lang="ts" setup>
import { VDataTable } from 'vuetify/labs/components'
import { BookBankBranch, BookBank, } from "~~/misc/types"

definePageMeta({ middleware: ["auth"] });

const { getBookBankByID } = useBookBank();
const { getBookBankBranchBy, } = useBookBankBranch();

const router = useRouter();

type Headers = InstanceType<typeof VDataTable>['headers']

const headers: Headers = [
  { key: "no", title: "#", sortable: false, width: 40 },
  { key: "branch_id", title: "รหัสสาขา", width: 160, },
  { key: "company_name", title: "บริษัท", },
  { key: "branch_name", title: "สาขา", },
];

const pending = ref(true)
const pending_book_bank_branch = ref(true)
const pagination = ref({ page: 1, size: 20, sorter: [] })
const book_bank = ref<BookBank>({
  book_bank_id: '',
  bank_id: '',
  book_bank_number: '',
  book_bank_name: '',
  book_bank_detail: '',
  bank_name: '',
});
const book_bank_branchs = ref<{
  docs: BookBankBranch[],
  totalDocs: number,
}>({
  docs: [],
  totalDocs: 0,
});

watch([pagination, book_bank], () => fetchBookBankBranch(), { flush: 'pre', immediate: true, deep: true })

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query: { [key: number | string]: string } = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    book_bank.value = await getBookBankByID({ book_bank_id: query.id })

    pending.value = false
  } catch (e) {
    console.log(e)

    await router.push({ path: '/book-bank' });
  }
})

async function fetchBookBankBranch() {
  const { book_bank_id } = book_bank.value

  if (!book_bank_id) return

  try {
    pending_book_bank_branch.value = true

    book_bank_branchs.value = await getBookBankBranchBy({
      match: { book_bank_id, },
      pagination: pagination.value,
      options: ['branch'],
    })
  } catch (e) {
    console.log(e)
  }

  pending_book_bank_branch.value = false
}
</script>
<template>
  <v-breadcrumbs :items="[
    { title: 'สมุดบัญชี', to: '/book-bank', },
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
        <div style="overflow-x: auto">
          <table class="table-detail" style="min-width: 300px" aria-describedby="detail">
            <thead>
              <tr>
                <th style="width: 120px"></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-right">รหัสสมุดบัญชี :</td>
                <td class="text-muted">{{ book_bank.book_bank_id }}</td>
              </tr>
              <tr>
                <td class="text-right">เลขที่บัญชี :</td>
                <td class="text-muted">{{ book_bank.book_bank_number }}</td>
              </tr>
              <tr>
                <td class="text-right">ชื่อบัญชี :</td>
                <td class="text-muted">{{ book_bank.book_bank_name }}</td>
              </tr>
              <tr>
                <td class="text-right">ธนาคาร :</td>
                <td class="text-muted">{{ book_bank.bank_name }}</td>
              </tr>
              <tr>
                <td class="text-right" style="vertical-align: top;">รายละอียด :</td>
                <td class="text-muted">{{ book_bank.book_bank_detail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <v-row class="mt-4">
          <v-col cols="12" md="8">
            <v-label class="mb-2">รายชื่อสาขา</v-label>
            <v-data-table-server :loading="pending_book_bank_branch" :headers="headers" :items="book_bank_branchs.docs"
              :items-length="book_bank_branchs.totalDocs" :items-per-page="pagination.size" :page="pagination.page"
              density="compact" @update:options="(e: any) => {
                pagination.page = e.page
                pagination.size = e.itemsPerPage
                pagination.sorter = e.sortBy
              }">
              <template v-slot:item.no="{ index }">{{ index + 1 }}</template>
              <template v-slot:item.branch_name="{ item }">{{ item.raw.branch.branch_name }}</template>
              <template v-slot:item.company_name="{ item }">{{ item.raw.branch.company_name }}</template>
            </v-data-table-server>
          </v-col>
        </v-row>
      </v-card-text>
    </template>
    <v-card-text class="d-flex flex-wrap justify-center gap-2">
      <v-btn type="submit" color="muted" :to="'/book-bank'">กลับ</v-btn>
    </v-card-text>
  </v-card>
</template>