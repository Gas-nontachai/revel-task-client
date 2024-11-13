import { Task } from "~~/misc/types"

const prefix = 'task'

const generateTaskID = (): Promise<string> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/generateTaskID`, { method: "POST" })

const getTaskByID = (data: { task_id: string }): Promise<Task> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/getTaskByID`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
}
)

const insertTask = async (data: { task: Task, task_img?: File[] }): Promise<Task> => {
  const formData = new FormData()
  formData.append("task", JSON.stringify(data.task))

  if (data.task_img) {
    data.task_img.forEach((file, index) => formData.append(`task_img_${index}`, file))
  }

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/insertTask`, {
    method: "POST",
    body: formData,
  }
  )
}

const updateTaskBy = async (data: { task: Task, task_img?: File[] }): Promise<Task> => {
  const formData = new FormData()
  formData.append("task", JSON.stringify(data.task))

  if (data.task_img) {
    data.task_img.forEach((file, index) => formData.append(`task_img_${index}`, file))
  }

  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/updateTaskBy`, {
    method: "POST",
    body: formData,
  }
  )
}

const deleteTaskBy = (data: { task_id: string }): Promise<Task> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/deleteTaskBy`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
}
)


export default function useTask() {
  return {
    generateTaskID,
    getTaskByID,
    insertTask,
    updateTaskBy,
    deleteTaskBy,
  }
}
