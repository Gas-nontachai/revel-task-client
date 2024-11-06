import { SyncDataLog } from "~~/misc/types"

const prefix = 'sync-data-log'

const getSyncDataLogBy = (data: any = {}): Promise<{ docs: SyncDataLog[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getSyncDataLogBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useSyncDataLog() {
  return {
    getSyncDataLogBy,
  };
}