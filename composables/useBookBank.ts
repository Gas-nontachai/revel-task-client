import { BookBankBranch, BookBank } from "~~/misc/types"

const prefix = 'book-bank'

const generateBookBankID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateBookBankID`, { method: "POST", })

const getBookBankBy = (data: any = {}): Promise<{ docs: BookBank[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBookBankBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getBookBankByID = (data: { book_bank_id: string }): Promise<BookBank> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBookBankByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getPaymentBookBankBy = (data: { branch_id: string }): Promise<BookBank[]> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getPaymentBookBankBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertBookBank = (data: {
  book_bank: BookBank,
  book_bank_branchs: BookBankBranch[],
}): Promise<BookBank> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertBookBank`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateBookBankBy = (data: {
  book_bank: BookBank,
  book_bank_branchs: BookBankBranch[],
}): Promise<BookBank> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateBookBankBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteBookBankBy = (data: { book_bank_id: string }): Promise<BookBank> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteBookBankBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useBookBank() {
  return {
    generateBookBankID,
    getBookBankBy,
    getBookBankByID,
    getPaymentBookBankBy,
    insertBookBank,
    updateBookBankBy,
    deleteBookBankBy
  };
}