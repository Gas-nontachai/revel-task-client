import { Bank } from "~~/misc/types"

const prefix = 'bank'

const getBankBy = (data: any = {}): Promise<{ docs: Bank[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getBankBy`, {
  method: "POST",
  body: JSON.stringify(data),
})


export default function useBank() {
  return {
    getBankBy,
  };
}