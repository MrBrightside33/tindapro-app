"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { getSeedRecordCounts } from "@/lib/api"

interface SeedCounts {
  sales: number
  salesLines: number
  items: number
  bills: number
  services: number
  suppliers: number
}

type LoadState =
  | { status: "loading" }
  | { status: "success"; counts: SeedCounts }
  | { status: "error"; message: string }

export function WorkspaceWelcome() {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })
  const [retryToken, setRetryToken] = React.useState(0)

  React.useEffect(() => {
    let isCurrent = true

    getSeedRecordCounts()
      .then((counts) => {
        if (isCurrent) {
          setState({ status: "success", counts })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "TindaPro could not load its local data.",
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [retryToken])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-emerald-700">
          Your store workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          A clearer notebook for your sari-sari store.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Record daily business activity here and let TindaPro organize the
          numbers. Sales, services, expenses, and item price history are kept
          together so business performance can be understood step by step.
        </p>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Phase 1 data foundation
        </h3>
        {state.status === "loading" && (
          <div
            aria-label="Loading seeded business records"
            className="mt-4 grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        )}
        {state.status === "error" && (
          <div
            role="alert"
            className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-red-800">{state.message}</p>
            <Button
              variant="outline"
              onClick={() => {
                setState({ status: "loading" })
                setRetryToken((token) => token + 1)
              }}
            >
              Try again
            </Button>
          </div>
        )}
        {state.status === "success" && (
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Sales", state.counts.sales],
              ["Sale lines", state.counts.salesLines],
              ["Remembered items", state.counts.items],
              ["Bills", state.counts.bills],
              ["Service records", state.counts.services],
              ["Suppliers", state.counts.suppliers],
            ].map(([label, count]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700"
              >
                <dd className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                  {count}
                </dd>
                <dt className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
