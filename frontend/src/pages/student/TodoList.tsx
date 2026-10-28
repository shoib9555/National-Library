import { useEffect, useMemo, useState } from "react"
import { isAxiosError } from "axios"
import {
  createTodo,
  deleteTodo,
  getMyTodos,
  updateTodo,
  type Todo,
} from "../../apis/todoApi"

function getTodoErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: unknown }
      | undefined

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message
    }

    if (error.response?.status === 401) {
      return "Your session has expired. Please log in again."
    }

    if (error.response?.status === 403) {
      return "You don't have permission to perform this action."
    }

    if (error.response?.status === 404) {
      return "The requested todo could not be found."
    }

    if (error.response?.status === 429) {
      return "Too many requests. Please wait a moment and try again."
    }

    if (error.response && error.response.status >= 500) {
      return "The server encountered an error. Please try again later."
    }

    if (!error.response) {
      return "Unable to connect to the server. Check your internet connection."
    }
  }

  return fallback
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTodo, setSavingTodo] = useState(false)
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTodo, setDeletingTodo] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null)

  const [pageError, setPageError] = useState("")
  const [formError, setFormError] = useState("")
  const [titleError, setTitleError] = useState("")
  const [actionError, setActionError] = useState("")

  const [successMessage, setSuccessMessage] = useState("")
  const [descriptionError, setDescriptionError] = useState("")

  const loadTodos = async () => {
    try {
      setLoading(true)
      setPageError("")

      const data = await getMyTodos()
      setTodos(data)
    } catch (error) {
      console.error("Failed to load todos:", error)
      setPageError(
        getTodoErrorMessage(error, "Failed to load your todos."),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  const filteredTodos = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return todos
    }

    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query),
    )
  }, [todos, search])

  const pendingTodos = filteredTodos.filter(
    (todo) => !todo.isCompleted,
  )

  const completedTodos = filteredTodos.filter(
    (todo) => todo.isCompleted,
  )

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDueDate("")
    setEditingTodo(null)
    setFormError("")
    setTitleError("")
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setTitle(todo.title)
    setDescription(todo.description ?? "")

    if (todo.dueDate) {
      setDueDate(todo.dueDate.slice(0, 10))
    } else {
      setDueDate("")
    }

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = title.trim()

    setFormError("")
    setTitleError("")

    if (!trimmedTitle) {
      setTitleError("Please enter a task title.")
      return
    }

    if (trimmedTitle.length > 50) {
      setTitleError("Task title cannot exceed 50 characters.")
      return
    }

    if (!description.trim()) {
      setDescriptionError("Please enter a task description.")
      return
    }

    try {
      setSavingTodo(true)

      if (editingTodo) {
        const updatedTodo = await updateTodo(editingTodo.id, {
          title: trimmedTitle,
          description: description.trim(),
          dueDate: dueDate
            ? new Date(`${dueDate}T23:59:59`).toISOString()
            : null,
        })

        setTodos((currentTodos) =>
          currentTodos.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          ),
        )
      } else {
        const newTodo = await createTodo({
          title: trimmedTitle,
          description: description.trim(),
          dueDate: dueDate
            ? new Date(`${dueDate}T23:59:59`).toISOString()
            : undefined,
        })

        setTodos((currentTodos) => [newTodo, ...currentTodos])
      }

      closeModal()
    } catch (error) {
      console.error("Failed to save todo:", error)
      setFormError(
        getTodoErrorMessage(
          error,
          editingTodo
            ? "Failed to update the task. Please try again."
            : "Failed to create the task. Please try again.",
        ),
      )
    } finally {
      setSavingTodo(false)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await updateTodo(todo.id, {
        isCompleted: !todo.isCompleted,
      })

      setTodos((currentTodos) =>
        currentTodos.map((item) =>
          item.id === updatedTodo.id ? updatedTodo : item,
        ),
      )
    } catch (error) {
      console.error("Failed to update todo:", error)
      setActionError(
        getTodoErrorMessage(error, "Failed to update the task."),
      )
    }
  }

  const handleDelete = (id: number) => {
    setTodoToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (todoToDelete === null) {
      return
    }

    try {
      setActionError("")
      setDeletingTodo(true)


      await deleteTodo(todoToDelete)

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== todoToDelete),
      )

      setShowDeleteModal(false)
      setTodoToDelete(null)
      setSuccessMessage("Todo deleted successfully!")
      setActionError("")
    } catch (error) {
      console.error("Failed to delete todo:", error)
      setActionError(
        getTodoErrorMessage(error, "Failed to delete the task."),
      )
    } finally {
      setDeletingTodo(false)
    }
  }

  const formatDueDate = (date: string | null | undefined) => {
    if (!date) {
      return null
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const renderTodo = (todo: Todo) => (
    <div
      key={todo.id}
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${todo.isCompleted
        ? "border-emerald-200 bg-emerald-50/40"
        : "border-slate-200"
        }`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => handleToggleComplete(todo)}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${todo.isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 hover:border-blue-500"
            }`}
          aria-label={
            todo.isCompleted
              ? "Mark todo as incomplete"
              : "Mark todo as complete"
          }
        >
          {todo.isCompleted && "✓"}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold ${todo.isCompleted
              ? "text-slate-500 line-through"
              : "text-slate-800"
              }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p
              className={`mt-1 text-sm ${todo.isCompleted
                ? "text-slate-400"
                : "text-slate-500"
                }`}
            >
              {todo.description}
            </p>
          )}

          {todo.dueDate && (
            <div className="mt-3 inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              Due: {formatDueDate(todo.dueDate)}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(todo)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDelete(todo.id)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Personal Productivity
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            To-Do List
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your personal study tasks and goals.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Todo
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {todos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">
            {todos.filter((todo) => !todo.isCompleted).length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">
            {todos.filter((todo) => todo.isCompleted).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your todos..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
        />
      </div>

      {pageError && (
        <div
          role="alert"
          className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{pageError}</p>
          <button
            type="button"
            onClick={loadTodos}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
          <button
            type="button"
            onClick={() => setActionError("")}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-3 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Todo Lists */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading your todos...
        </div>
      ) : pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-semibold text-red-700">
            Could not load your todos.
          </p>
          <p className="mt-2 text-sm text-red-600">{pageError}</p>
          <button
            type="button"
            onClick={loadTodos}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">
            No todos found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Create a task to start organizing your study goals.
          </p>

          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Your First Todo
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingTodos.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  Pending Tasks
                </h2>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {pendingTodos.length}
                </span>
              </div>

              <div className="space-y-3">
                {pendingTodos.map(renderTodo)}
              </div>
            </section>
          )}

          {completedTodos.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  Completed Tasks
                </h2>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {completedTodos.length}
                </span>
              </div>

              <div className="space-y-3">
                {completedTodos.map(renderTodo)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTodo ? "Edit Todo" : "Add Todo"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a personal task for your study routine.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setTitleError("")
                    setFormError("")
                  }}
                  placeholder="e.g. Complete 3 DSA problems"
                  maxLength={50}
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? "todo-title-error" : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 ${titleError ? "border-red-500" : "border-slate-200"
                    }`}
                />

                {titleError && (
                  <p id="todo-title-error" role="alert" className="mt-2 text-sm text-red-600">
                    {titleError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    setDescriptionError("")
                    setFormError("")
                  }}
                  placeholder="Add details about this task..."
                  maxLength={200}
                  rows={4}
                  aria-invalid={Boolean(descriptionError)}
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 ${descriptionError
                    ? "border-red-500"
                    : "border-slate-200"
                    }`}

                />
                <p className="mt-1 text-right text-xs text-slate-500">
                  {description.length}/200 characters
                </p>
              </div>

              {descriptionError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {descriptionError}
                </p>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingTodo}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingTodo
                    ? "Adding..."
                    : editingTodo
                      ? "Save Changes"
                      : "Add Todo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowDeleteModal(false)
            setTodoToDelete(null)
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 9v4M12 17h.01"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M10.3 3.8L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Delete Todo?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to delete this task? This action
                  cannot be undone.
                </p>

                {actionError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {actionError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setTodoToDelete(null)
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingTodo}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingTodo ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}