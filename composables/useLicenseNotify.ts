import { LicenseNotify, } from "~~/misc/types"

const prefix = 'license-notify'

const getLicenseNotifyBy = (data?: any): Promise<{ docs: LicenseNotify[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getLicenseNotifyBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useLicenseNotify() {
  return {
    getLicenseNotifyBy,
  };
}