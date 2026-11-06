"use client"

import * as React from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Field, controlClassName } from "@/components/common/form-controls"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { createBill, deleteBill, getBills, updateBill } from "@/lib/api"
import {
  BILL_CATEGORIES,
  type Bill,
  type BillCategory,
  type NewBill,
  type RecordStatus,
} from "@/types/domain"

type LoadState =
  | { status: "loading" }
  | { status: "success"; bills: Bill[] }
  | { status: "error"; message: string }

const categoryLabels: Record<BillCategory, string> = {
  electricity: "Electricity",
  water: "Water",
  rent: "Rent",
  transport: "Transport",
  restocking: "Restocking",
  other: "Other",
}

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
})

function getToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toInputDate(value: string): string {
  return value.slice(0, 10)
}

const emptyBill = (): NewBill => ({
  date: getToday(),
  dueDate: null,
  category: "electricity",
  description: "",
  amount: 0,
  status: "paid",
})

export function BillsManager() {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })
  const [categoryFilter, setCategoryFilter] = React.useState<
    BillCategory | "all"
  >("all")
  const [statusFilter, setStatusFilter] = React.useState<
    RecordStatus | "all"
  >("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<NewBill>(emptyBill())
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retryToken, setRetryToken] = React.useState(0)

  React.useEffect(() => {
    let active = true
    getBills()
      .then((bills) => {
        if (active) {
          setState({ status: "success", bills })
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              cause instanceof Error ? cause.message : "Could not load bills.",
          })
        }
      })
    return () => {
      active = false
    }
  }, [retryToken])

  const allBills = state.status === "success" ? state.bills : []
  const filteredBills = allBills
    .filter(
      (bill) =>
        (categoryFilter === "all" || bill.category === categoryFilter) &&
        (statusFilter === "all" || bill.status === statusFilter)
    )
    .sort((a, b) => b.date.localeCompare(a.date))
  const paidTotal = allBills
    .filter((bill) => bill.status === "paid")
    .reduce((total, bill) => total + bill.amount, 0)
  const unpaidTotal = allBills
    .filter((bill) => bill.status === "unpaid")
    .reduce((total, bill) => total + bill.amount, 0)

  function startCreate() {
    setEditingId(null)
    setForm(emptyBill())
    setError(null)
    setFormOpen(true)
  }

  function startEdit(bill: Bill) {
    setEditingId(bill.id)
    setForm({
      date: toInputDate(bill.date),
      dueDate: bill.dueDate ? toInputDate(bill.dueDate) : null,
      category: bill.category,
      description: bill.description,
      amount: bill.amount,
      status: bill.status,
    })
    setError(null)
    setFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const input: NewBill = {
      ...form,
      date: new Date(`${form.date}T12:00:00`).toISOString(),
      dueDate: form.dueDate
        ? new Date(`${form.dueDate}T12:00:00`).toISOString()
        : null,
      amount: Number(form.amount),
    }

    try {
      const saved = editingId
        ? await updateBill(editingId, input)
        : await createBill(input)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              bills: editingId
                ? current.bills.map((bill) =>
                    bill.id === saved.id ? saved : bill
                  )
                : [saved, ...current.bills],
            }
          : current
      )
      setFormOpen(false)
      setEditingId(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save bill.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(bill: Bill) {
    if (!window.confirm(`Delete "${bill.description}"?`)) {
      return
    }
    setError(null)
    try {
      await deleteBill(bill.id)
      setState((current) =>
        current.status === "success"
          ? {
              status: "success",
              bills: current.bills.filter((entry) => entry.id !== bill.id),
            }
          : current
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete bill.")
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paid bills
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {currencyFormatter.format(paidTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Unpaid bills
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            {currencyFormatter.format(unpaidTotal)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:max-w-lg">
            <Field label="Category" htmlFor="bill-category-filter">
              <select
                id="bill-category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.currentTarget.value as BillCategory | "all"
                  )
                }
                className={controlClassName}
              >
                <option value="all">All categories</option>
                {BILL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment status" htmlFor="bill-status-filter">
              <select
                id="bill-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.currentTarget.value as RecordStatus | "all"
                  )
                }
                className={controlClassName}
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </Field>
          </div>
          <Button type="button" onClick={startCreate}>
            <Plus aria-hidden="true" />
            Add bill
          </Button>
        </div>
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
              {editingId ? "Edit bill" : "Add bill"}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close bill form"
              onClick={() => setFormOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Description" htmlFor="bill-description">
                <input
                  id="bill-description"
                  required
                  autoFocus
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.currentTarget.value })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Category" htmlFor="bill-category">
                <select
                  id="bill-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.currentTarget.value as BillCategory,
                    })
                  }
                  className={controlClassName}
                >
                  {BILL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Amount (₱)" htmlFor="bill-amount">
                <input
                  id="bill-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: Number(event.currentTarget.value),
                    })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Bill date" htmlFor="bill-date">
                <input
                  id="bill-date"
                  type="date"
                  required
                  value={toInputDate(form.date)}
                  onChange={(event) =>
                    setForm({ ...form, date: event.currentTarget.value })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Due date (optional)" htmlFor="bill-due-date">
                <input
                  id="bill-due-date"
                  type="date"
                  value={form.dueDate ? toInputDate(form.dueDate) : ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dueDate: event.currentTarget.value || null,
                    })
                  }
                  className={controlClassName}
                />
              </Field>
              <Field label="Status" htmlFor="bill-status">
                <select
                  id="bill-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.currentTarget.value as RecordStatus,
                    })
                  }
                  className={controlClassName}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </Field>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span
                title="Restocking is recorded as a cash outflow. Goods sold already contribute their cost through cost of goods sold, so restocking is excluded from operating expenses."
                className="cursor-help underline decoration-dotted underline-offset-2"
              >
                Restocking is excluded from operating expenses
              </span>{" "}
              to avoid counting the cost of goods twice.
            </p>
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
                    : "Save bill"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {state.status === "loading" && (
        <div
          aria-label="Loading bills"
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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {filteredBills.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              {allBills.length === 0
                ? "No bills recorded yet. Add your first bill to get started."
                : "No bills match these filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/70 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3">Description</th>
                    <th scope="col" className="px-5 py-3">Category</th>
                    <th scope="col" className="px-5 py-3">Due date</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Amount</th>
                    <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">
                        {new Intl.DateTimeFormat("en-PH", {
                          dateStyle: "medium",
                        }).format(new Date(bill.date))}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {bill.description}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                        {categoryLabels[bill.category]}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">
                        {bill.dueDate
                          ? new Intl.DateTimeFormat("en-PH", {
                              dateStyle: "medium",
                            }).format(new Date(bill.dueDate))
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                        {currencyFormatter.format(bill.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${bill.description}`}
                            onClick={() => startEdit(bill)}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${bill.description}`}
                            onClick={() => void handleDelete(bill)}
                          >
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
