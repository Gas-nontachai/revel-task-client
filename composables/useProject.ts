import { Project } from "~~/misc/project"

const prefix = 'project'

const generateProjectID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateProjectID`, { method: "POST" })

const getProjectBy = (data: any = {}): Promise<{ docs: Project[], totalDocs: number }> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProjectBy`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
}
)

const getProjectByID = (data: { project_id: string }): Promise<Project> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getProjectByID`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
}
)

const insertProject = async (data: { project: Project, project_img?: File[] }): Promise<Project> => {
  const formData = new FormData()
  formData.append("project", JSON.stringify(data.project))

  if (data.project_img) {
    data.project_img.forEach((file, index) => formData.append(`project_img_${index}`, file))
  }

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertProject`, {
    method: "POST",
    body: formData,
  }
  )
}

const updateProjectBy = async (data: { project: Project, project_img?: File[] }): Promise<Project> => {
  const formData = new FormData()
  formData.append("project", JSON.stringify(data.project))

  if (data.project_img) {
    data.project_img.forEach((file, index) => formData.append(`project_img_${index}`, file))
  }

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateProjectBy`, {
    method: "POST",
    body: formData,
  }
  )
}

const deleteProjectBy = (data: { project_id: string }): Promise<Project> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteProjectBy`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
}
)

export default function useProject() {
  return {
    generateProjectID,
    getProjectBy,
    getProjectByID,
    insertProject,
    updateProjectBy,
    deleteProjectBy
  }
}
