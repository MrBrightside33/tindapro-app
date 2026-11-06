import {
  createRecordId,
  readStoreDatabase,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type { NewNote, Note } from "@/types/domain"

function normalizeNote(input: NewNote): NewNote {
  const normalized = {
    title: input.title.trim(),
    content: input.content.trim(),
  }

  if (!normalized.title) {
    throw new Error("Note title cannot be empty.")
  }
  if (!normalized.content) {
    throw new Error("Note details cannot be empty.")
  }

  return normalized
}

export async function getNotes(): Promise<Note[]> {
  return readStoreDatabase().notes
}

export async function createNote(input: NewNote): Promise<Note> {
  const now = new Date().toISOString()
  const note: Note = {
    ...normalizeNote(input),
    id: createRecordId("note"),
    pinned: false,
    createdAt: now,
    updatedAt: now,
  }

  return updateStoreDatabase((database) => ({
    database: { ...database, notes: [...database.notes, note] },
    result: note,
  }))
}

export async function updateNote(
  noteId: string,
  input: Partial<NewNote> & { pinned?: boolean }
): Promise<Note> {
  return updateStoreDatabase((database) => {
    const existing = database.notes.find((note) => note.id === noteId)
    if (!existing) {
      throw new Error(`Note ${noteId} was not found.`)
    }

    const content = normalizeNote({
      title: input.title ?? existing.title,
      content: input.content ?? existing.content,
    })
    const updatedNote: Note = {
      ...existing,
      ...content,
      pinned: input.pinned ?? existing.pinned,
      updatedAt: new Date().toISOString(),
    }

    return {
      database: {
        ...database,
        notes: database.notes.map((note) =>
          note.id === noteId ? updatedNote : note
        ),
      },
      result: updatedNote,
    }
  })
}

export async function deleteNote(noteId: string): Promise<void> {
  updateStoreDatabase((database) => {
    if (!database.notes.some((note) => note.id === noteId)) {
      throw new Error(`Note ${noteId} was not found.`)
    }
    return {
      database: {
        ...database,
        notes: database.notes.filter((note) => note.id !== noteId),
      },
      result: undefined,
    }
  })
}
