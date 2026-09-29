import { Request, Response } from "express"
import prisma from "../lib/prisma"
import {
  createTodo,
  getMyTodos,
  updateTodo,
  deleteTodo,
  createNote,
  getMyNotes,
  updateNote,
  deleteNote,
} from "../services/todoService"
import { AuthenticatedRequest } from "../middleware/authMiddleware"

async function getStudentId(req: AuthenticatedRequest): Promise<number> {
  if (!req.user) {
    throw new Error("Authentication required")
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: req.user.userId,
    },
    select: {
      id: true,
    },
  })

  if (!student) {
    throw new Error("Student profile not found")
  }

  return student.id
}

// ==================== TODOS ====================

export async function createTodoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const { title, description, dueDate } = req.body

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Todo title is required",
      })
    }

    const todo = await createTodo(
      studentId,
      title.trim(),
      description?.trim(),
      dueDate ? new Date(dueDate) : undefined,
    )

    return res.status(201).json({
      message: "Todo created successfully",
      todo,
    })
  } catch (error) {
    console.error("Create todo error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function getMyTodosController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const todos = await getMyTodos(studentId)

    return res.status(200).json({
      message: "Todos fetched successfully",
      todos,
    })
  } catch (error) {
    console.error("Get todos error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function updateTodoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
   const studentId = await getStudentId(req)

    const todoId = Number(req.params.id)

    if (Number.isNaN(todoId)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      })
    }

    const { title, description, dueDate, isCompleted } = req.body

    const todo = await updateTodo(studentId, todoId, {
      title: typeof title === "string" ? title.trim() : undefined,
      description:
        typeof description === "string"
          ? description.trim()
          : undefined,
      dueDate:
        dueDate === null
          ? null
          : dueDate
            ? new Date(dueDate)
            : undefined,
      isCompleted:
        typeof isCompleted === "boolean"
          ? isCompleted
          : undefined,
    })

    return res.status(200).json({
      message: "Todo updated successfully",
      todo,
    })
  } catch (error) {
    console.error("Update todo error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function deleteTodoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
   const studentId = await getStudentId(req)

    const todoId = Number(req.params.id)

    if (Number.isNaN(todoId)) {
      return res.status(400).json({
        message: "Invalid todo ID",
      })
    }

    const result = await deleteTodo(studentId, todoId)

    return res.status(200).json(result)
  } catch (error) {
    console.error("Delete todo error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

// ==================== NOTES ====================

export async function createNoteController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const { title, content } = req.body

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Note title is required",
      })
    }

    if (
      !content ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Note content is required",
      })
    }

    const note = await createNote(
      studentId,
      title.trim(),
      content.trim(),
    )

    return res.status(201).json({
      message: "Note created successfully",
      note,
    })
  } catch (error) {
    console.error("Create note error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function getMyNotesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const notes = await getMyNotes(studentId)

    return res.status(200).json({
      message: "Notes fetched successfully",
      notes,
    })
  } catch (error) {
    console.error("Get notes error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function updateNoteController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const noteId = Number(req.params.id)

    if (Number.isNaN(noteId)) {
      return res.status(400).json({
        message: "Invalid note ID",
      })
    }

    const { title, content } = req.body

    const note = await updateNote(studentId, noteId, {
      title: typeof title === "string" ? title.trim() : undefined,
      content:
        typeof content === "string"
          ? content.trim()
          : undefined,
    })

    return res.status(200).json({
      message: "Note updated successfully",
      note,
    })
  } catch (error) {
    console.error("Update note error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function deleteNoteController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const studentId = await getStudentId(req)

    const noteId = Number(req.params.id)

    if (Number.isNaN(noteId)) {
      return res.status(400).json({
        message: "Invalid note ID",
      })
    }

    const result = await deleteNote(studentId, noteId)

    return res.status(200).json(result)
  } catch (error) {
    console.error("Delete note error:", error)

    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}