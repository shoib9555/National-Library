import apiClient from "./client"

export interface Note {
  id: number
  studentId: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface NotesResponse {
  message: string
  notes: Note[]
}

interface NoteResponse {
  message: string
  note: Note
}

interface DeleteNoteResponse {
  message: string
}

export async function createNote(data: {
  title: string
  content: string
}): Promise<Note> {
  const response = await apiClient.post<NoteResponse>(
    "/notes",
    data,
  )

  return response.data.note
}

export async function getMyNotes(): Promise<Note[]> {
  const response = await apiClient.get<NotesResponse>(
    "/notes/me",
  )

  return response.data.notes
}

export async function updateNote(
  id: number,
  data: {
    title?: string
    content?: string
  },
): Promise<Note> {
  const response = await apiClient.patch<NoteResponse>(
    `/notes/${id}`,
    data,
  )

  return response.data.note
}

export async function deleteNote(id: number): Promise<string> {
  const response = await apiClient.delete<DeleteNoteResponse>(
    `/notes/${id}`,
  )

  return response.data.message
}