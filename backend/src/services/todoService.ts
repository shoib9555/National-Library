import prisma from "../lib/prisma"

export async function createTodo(
  studentId: number,
  title: string,
  description?: string,
  dueDate?: Date,
) {
  return prisma.todo.create({
    data: {
      studentId,
      title,
      description,
      dueDate,
    },
  })
}

export async function getMyTodos(studentId: number) {
  return prisma.todo.findMany({
    where: {
      studentId,
    },
    orderBy: [
      {
        isCompleted: "asc",
      },
      {
        dueDate: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  })
}

export async function updateTodo(
  studentId: number,
  todoId: number,
  data: {
    title?: string
    description?: string
    dueDate?: Date | null
    isCompleted?: boolean
  },
) {
  const todo = await prisma.todo.findFirst({
    where: {
      id: todoId,
      studentId,
    },
  })

  if (!todo) {
    throw new Error("Todo not found")
  }

  return prisma.todo.update({
    where: {
      id: todoId,
    },
    data,
  })
}

export async function deleteTodo(
  studentId: number,
  todoId: number,
) {
  const todo = await prisma.todo.findFirst({
    where: {
      id: todoId,
      studentId,
    },
  })

  if (!todo) {
    throw new Error("Todo not found")
  }

  await prisma.todo.delete({
    where: {
      id: todoId,
    },
  })

  return {
    message: "Todo deleted successfully",
  }
}

// ==================== NOTES ====================

export async function createNote(
  studentId: number,
  title: string,
  content: string,
) {
  return prisma.note.create({
    data: {
      studentId,
      title,
      content,
    },
  })
}

export async function getMyNotes(studentId: number) {
  return prisma.note.findMany({
    where: {
      studentId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}

export async function updateNote(
  studentId: number,
  noteId: number,
  data: {
    title?: string
    content?: string
  },
) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      studentId,
    },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  return prisma.note.update({
    where: {
      id: noteId,
    },
    data,
  })
}

export async function deleteNote(
  studentId: number,
  noteId: number,
) {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      studentId,
    },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  })

  return {
    message: "Note deleted successfully",
  }
}