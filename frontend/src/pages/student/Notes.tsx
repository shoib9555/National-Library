import { useEffect, useMemo, useState } from "react"
import {
  createNote,
  deleteNote,
  getMyNotes,
  updateNote,
  type Note,
} from "../../apis/noteApi"

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [savingNote, setSavingNote] = useState(false)
  const [deletingNote, setDeletingNote] = useState(false)
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)

  const loadNotes = async () => {
    try {
      setLoading(true)

      const data = await getMyNotes()

      setNotes(data)
    } catch (error) {
      console.error("Failed to load notes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return notes
    }

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query),
    )
  }, [notes, search])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setSelectedNote(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      return
    }

    try {
      setSavingNote(true)

      if (selectedNote) {
        const updatedNote = await updateNote(selectedNote.id, {
          title: title.trim(),
          content: content.trim(),
        })

        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note,
          ),
        )
      } else {
        const newNote = await createNote({
          title: title.trim(),
          content: content.trim(),
        })

        setNotes((currentNotes) => [newNote, ...currentNotes])
      }

      closeModal()
    } catch (error) {
      console.error("Failed to save note:", error)
    } finally {
      setSavingNote(false)
    }
  }

  const handleDelete = (id: number) => {
    setNoteToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (noteToDelete === null) {
      return
    }

    try {
      setDeletingNote(true)

      await deleteNote(noteToDelete)

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteToDelete),
      )

      setShowDeleteModal(false)
      setNoteToDelete(null)
    } catch (error) {
      console.error("Failed to delete note:", error)
    } finally {
      setDeletingNote(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Personal Knowledge
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            My Notes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and organize your personal study notes.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Note
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Notes</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {notes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">Showing</p>

          <p className="mt-1 text-2xl font-bold text-blue-800">
            {filteredNotes.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your notes..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
        />
      </div>

      {/* Notes */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading your notes...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">
            No notes found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Create a note to start organizing your knowledge.
          </p>

          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 text-lg font-bold text-slate-800">
                  {note.title}
                </h2>

                <div className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  Note
                </div>
              </div>

              <p className="line-clamp-5 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {note.content}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">
                  Updated {formatDate(note.updatedAt)}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(note)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedNote ? "Edit Note" : "Add Note"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Save your personal study knowledge here.
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
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Note Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Sliding Window DSA Notes"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Note Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your detailed notes here..."
                  rows={10}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
                  required
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
                  disabled={savingNote}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNote
                    ? selectedNote
                      ? "Saving..."
                      : "Adding..."
                    : selectedNote
                      ? "Save Changes"
                      : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowDeleteModal(false)
            setNoteToDelete(null)
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
                  Delete Note?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to delete this note? This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setNoteToDelete(null)
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingNote}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingNote ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}