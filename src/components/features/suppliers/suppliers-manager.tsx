"use client"

import * as React from "react"
import { Pencil, Plus, Search, Trash2, X } from "lucide-react"

import { Field, controlClassName } from "@/components/common/form-controls"
import { Button } from "@/components/ui/button"
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/lib/api"
import type { NewSupplier, Supplier } from "@/types/domain"

type LoadState =
  | { status: "loading" }
  | { status: "success"; suppliers: Supplier[] }
  | { status: "error"; message: string }

const emptySupplier: NewSupplier = {
  name: "",
  contact: "",
  productCategory: "",
  deliveryFrequency: "",
}

export function SuppliersManager() {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })
  const [search, setSearch] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<NewSupplier>(emptySupplier)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryToken, setRetryToken] = React.useState(0)

  React.useEffect(() => {
    let active = true
    getSuppliers()
      .then((suppliers) => {
        if (active) {
          setState({ status: "success", suppliers })
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              cause instanceof Error
                ? cause.message
                : "Could not load suppliers.",
          })
        }
      })
    return () => {
      active = false
    }
  }, [retryToken])

  const suppliers =
    state.status === "success"
      ? state.suppliers.filter((supplier) =>
          [
            supplier.name,
            supplier.contact,
            supplier.productCategory,
            supplier.deliveryFrequency,
          ].some((value) => value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
        )
      : []

  function openCreateForm() {
    setEditingId(null)
    setForm(emptySupplier)
    setError(null)
    setFormOpen(true)
  }

  function openEditForm(supplier: Supplier) {
    setEditingId(supplier.id)
    setForm({
      name: supplier.name,
      contact: supplier.contact,
      productCategory: supplier.productCategory,
      deliveryFrequency: supplier.deliveryFrequency,
    })
    setError(null)
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const saved = editingId
        ? await updateSupplier(editingId, form)
        : await createSupplier(form)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              suppliers: editingId
                ? current.suppliers.map((supplier) =>
                    supplier.id === saved.id ? saved : supplier
                  )
                : [saved, ...current.suppliers],
            }
          : current
      )
      setFormOpen(false)
      setForm(emptySupplier)
      setEditingId(null)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save supplier."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(supplier: Supplier) {
    if (!window.confirm(`Delete ${supplier.name}?`)) {
      return
    }
    setError(null)
    try {
      await deleteSupplier(supplier.id)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              suppliers: current.suppliers.filter(
                (entry) => entry.id !== supplier.id
              ),
            }
          : current
      )
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not delete supplier."
      )
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search suppliers</span>
            <Search
              size={17}
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search suppliers..."
              className={`${controlClassName} mt-0 pl-9`}
            />
          </label>
          <Button type="button" onClick={openCreateForm}>
            <Plus aria-hidden="true" />
            Add supplier
          </Button>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {formOpen && (
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">
              {editingId ? "Edit supplier" : "Add supplier"}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close supplier form"
              onClick={() => setFormOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Supplier name" htmlFor="supplier-name">
                <input
                  id="supplier-name"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.currentTarget.value })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Contact" htmlFor="supplier-contact">
                <input
                  id="supplier-contact"
                  required
                  value={form.contact}
                  onChange={(event) =>
                    setForm({ ...form, contact: event.currentTarget.value })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Product category" htmlFor="supplier-category">
                <input
                  id="supplier-category"
                  required
                  value={form.productCategory}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      productCategory: event.currentTarget.value,
                    })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Delivery frequency" htmlFor="supplier-frequency">
                <input
                  id="supplier-frequency"
                  required
                  value={form.deliveryFrequency}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      deliveryFrequency: event.currentTarget.value,
                    })
                  }
                  placeholder="e.g. Weekly"
                  className={controlClassName}
                />
              </Field>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Save supplier"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {state.status === "loading" && (
        <div
          aria-label="Loading suppliers"
          className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
        />
      )}
      {state.status === "error" && (
        <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">{state.message}</p>
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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {suppliers.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {search ? "No suppliers match your search." : "No suppliers yet. Add your first supplier to get started."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/70 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-3">Supplier</th>
                    <th scope="col" className="px-5 py-3">Contact</th>
                    <th scope="col" className="px-5 py-3">Product category</th>
                    <th scope="col" className="px-5 py-3">Delivery</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">{supplier.name}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{supplier.contact}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{supplier.productCategory}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{supplier.deliveryFrequency}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${supplier.name}`} onClick={() => openEditForm(supplier)}>
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${supplier.name}`} onClick={() => void handleDelete(supplier)}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
