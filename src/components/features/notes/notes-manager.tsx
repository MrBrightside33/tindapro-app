"use client"

import * as React from "react"
import { Pin, PinOff, Pencil, Plus, Trash2, X } from "lucide-react"

import { Field, controlClassName } from "@/components/common/form-controls"
import { Button } from "@/components/ui/button"
import { createNote, deleteNote, getNotes, updateNote } from "@/lib/api"
import type { NewNote, Note } from "@/types/domain"

type LoadState =
  | { status: "loading" }
  | { status: "success"; notes: Note[] }
  | { status: "error"; message: string }

const emptyNote: NewNote = { title: "", content: "" }

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      b.updatedAt.localeCompare(a.updatedAt)
  )
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function NotesManager() {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<NewNote>(emptyNote)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryToken, setRetryToken] = React.useState(0)

  React.useEffect(() => {
    let active = true
    getNotes()
      .then((notes) => {
        if (active) {
          setState({ status: "success", notes: sortNotes(notes) })
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              cause instanceof Error ? cause.message : "Could not load notes.",
          })
        }
      })
    return () => {
      active = false
    }
  }, [retryToken])

  function startCreate() {
    setForm(emptyNote)
    setEditingId(null)
    setError(null)
    setFormOpen(true)
  }

  function startEdit(note: Note) {
    setForm({ title: note.title, content: note.content })
    setEditingId(note.id)
    setError(null)
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const saved = editingId
        ? await updateNote(editingId, form)
        : await createNote(form)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              notes: sortNotes(
                editingId
                  ? current.notes.map((note) =>
                      note.id === saved.id ? saved : note
                    )
                  : [saved, ...current.notes]
              ),
            }
          : current
      )
      setFormOpen(false)
      setForm(emptyNote)
      setEditingId(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save note.")
    } finally {
      setSaving(false)
    }
  }

  async function handlePin(note: Note) {
    setError(null)
    try {
      const updated = await updateNote(note.id, { pinned: !note.pinned })
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              notes: sortNotes(
                current.notes.map((entry) =>
                  entry.id === updated.id ? updated : entry
                )
              ),
            }
          : current
      )
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update note."
      )
    }
  }

  async function handleDelete(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) {
      return
    }
    setError(null)
    try {
      await deleteNote(note.id)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              notes: current.notes.filter((entry) => entry.id !== note.id),
            }
          : current
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete note.")
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Keep reminders and useful store details in one easy-to-find place.
        </p>
        <Button type="button" onClick={startCreate}>
          <Plus aria-hidden="true" />
          Add note
        </Button>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}

      {formOpen && (
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">
              {editingId ? "Edit note" : "New note"}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close note form"
              onClick={() => setFormOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title" htmlFor="note-title">
              <input
                id="note-title"
                required
                autoFocus
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.currentTarget.value })
                }
                className={controlClassName}
              />
            </Field>
            <Field label="Details" htmlFor="note-content">
              <textarea
                id="note-content"
                required
                rows={5}
                maxLength={4000}
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.currentTarget.value })
                }
                className={controlClassName}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Save note"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {state.status === "loading" && (
        <div
          aria-label="Loading notes"
          className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
        />
      )}
      {state.status === "error" && (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            {state.message}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setState({ status: "loading" })
              setRetryToken((token) => token + 1)
            }}
          >
            Try again
          </Button>
        </section>
      )}
      {state.status === "success" && (
        state.notes.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No notes yet
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a reminder or store detail to keep it handy.
            </p>
          </section>
        ) : (
          <section aria-label="Store notes" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {state.notes.map((note) => (
              <article
                key={note.id}
                className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold text-slate-950 dark:text-slate-100">
                      {note.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Updated {formatUpdatedAt(note.updatedAt)}
                    </p>
                  </div>
                  {note.pinned && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Pin size={12} aria-hidden="true" />
                      Pinned
                    </span>
                  )}
                </div>
                <p className="mt-4 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {note.content}
                </p>
                <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`${note.pinned ? "Unpin" : "Pin"} ${note.title}`}
                    onClick={() => void handlePin(note)}
                  >
                    {note.pinned ? (
                      <PinOff aria-hidden="true" />
                    ) : (
                      <Pin aria-hidden="true" />
                    )}
                    {note.pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${note.title}`}
                    onClick={() => startEdit(note)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${note.title}`}
                    onClick={() => void handleDelete(note)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )
      )}
    </div>
  )
}
