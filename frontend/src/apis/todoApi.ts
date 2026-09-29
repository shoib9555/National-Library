import apiClient from "./client"

export interface Todo {
  id: number
  studentId: number
  title: string
  description?: string | null
  isCompleted: boolean
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

interface TodosResponse {
  message: string
  todos: Todo[]
}

interface TodoResponse {
  message: string
  todo: Todo
}

interface DeleteTodoResponse {
  message: string
}

export async function createTodo(data: {
  title: string
  description?: string
  dueDate?: string
}): Promise<Todo> {
  const response = await apiClient.post<TodoResponse>("/todos", data)
  return response.data.todo
}

export async function getMyTodos(): Promise<Todo[]> {
  const response = await apiClient.get<TodosResponse>("/todos/me")
  return response.data.todos
}

export async function updateTodo(
  id: number,
  data: {
    title?: string
    description?: string
    dueDate?: string | null
    isCompleted?: boolean
  },
): Promise<Todo> {
  const response = await apiClient.patch<TodoResponse>(
    `/todos/${id}`,
    data,
  )

  return response.data.todo
}

export async function deleteTodo(id: number): Promise<string> {
  const response = await apiClient.delete<DeleteTodoResponse>(
    `/todos/${id}`,
  )

  return response.data.message
}