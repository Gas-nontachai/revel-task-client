import { SyncData } from "~~/misc/types"

const prefix = 'sync-data'

const getSyncDataBy = (data: any = {}): Promise<{ docs: SyncData[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getSyncDataBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useSyncData() {
  return {
    getSyncDataBy,
  };
}