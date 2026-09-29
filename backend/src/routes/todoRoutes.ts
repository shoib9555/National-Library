import { Router } from "express"
import { authMiddleware, authorize } from "../middleware/authMiddleware"
import {
  createTodoController,
  getMyTodosController,
  updateTodoController,
  deleteTodoController,
  createNoteController,
  getMyNotesController,
  updateNoteController,
  deleteNoteController,
} from "../controllers/todoController"

const router = Router()

// ==================== TODOS ====================

router.post(
  "/todos",
  authMiddleware,
  authorize("STUDENT"),
  createTodoController,
)

router.get(
  "/todos/me",
  authMiddleware,
  authorize("STUDENT"),
  getMyTodosController,
)

router.patch(
  "/todos/:id",
  authMiddleware,
  authorize("STUDENT"),
  updateTodoController,
)

router.delete(
  "/todos/:id",
  authMiddleware,
  authorize("STUDENT"),
  deleteTodoController,
)

// ==================== NOTES ====================

router.post(
  "/notes",
  authMiddleware,
  authorize("STUDENT"),
  createNoteController,
)

router.get(
  "/notes/me",
  authMiddleware,
  authorize("STUDENT"),
  getMyNotesController,
)

router.patch(
  "/notes/:id",
  authMiddleware,
  authorize("STUDENT"),
  updateNoteController,
)

router.delete(
  "/notes/:id",
  authMiddleware,
  authorize("STUDENT"),
  deleteNoteController,
)

export default router