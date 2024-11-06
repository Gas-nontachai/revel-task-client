import { License, LicenseNotify, Permission } from "~~/misc/types"

const prefix = 'license'

const generateLicenseID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateLicenseID`, { method: "POST", })

const getLicenseBy = (data?: any): Promise<{ docs: License[], totalDocs: number, }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getLicenseBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const getLicenseByID = (data: { license_id: string }): Promise<License> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getLicenseByID`, {
  method: "POST",
  body: JSON.stringify(data),
})

const insertLicense = (data: {
  license: License,
  license_notifys: LicenseNotify[],
  permissions: Permission[],
}): Promise<License> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertLicense`, {
  method: "POST",
  body: JSON.stringify(data),
})

const updateLicenseBy = (data: {
  license: License,
  license_notifys: LicenseNotify[],
  permissions: Permission[],
}): Promise<License> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateLicenseBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

const deleteLicenseBy = (data: { license_id: string }): Promise<License> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteLicenseBy`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useLicense() {
  return {
    generateLicenseID,
    getLicenseBy,
    getLicenseByID,
    insertLicense,
    updateLicenseBy,
    deleteLicenseBy
  };
}