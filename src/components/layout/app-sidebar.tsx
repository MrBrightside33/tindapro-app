"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calculator,
  FileText,
  Home,
  Lightbulb,
  NotebookPen,
  Receipt,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Wallet,
  Wrench,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationGroups = [
  {
    label: "Main",
    items: [{ label: "Overview", href: "/overview", icon: Home }],
  },
  {
    label: "Sales",
    items: [
      { label: "Sales", href: "/sales", icon: ShoppingCart },
      { label: "Services", href: "/services", icon: Wrench },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Bills", href: "/bills", icon: Receipt },
      { label: "Cash Vault", href: "/cash-vault", icon: Wallet },
      { label: "Accounting", href: "/accounting", icon: Calculator },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Notes", href: "/notes", icon: NotebookPen },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Descriptive",
        href: "/analytics/descriptive",
        icon: BarChart3,
      },
      {
        label: "Predictive",
        href: "/analytics/predictive",
        icon: TrendingUp,
      },
      {
        label: "Prescriptive",
        href: "/analytics/prescriptive",
        icon: Lightbulb,
      },
    ],
  },
  {
    label: "Tools",
    items: [{ label: "Reports", href: "/reports", icon: FileText }],
  },
]

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 text-slate-100 transition-transform duration-200 md:translate-x-0",
          isOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full md:visible"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/overview"
            className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            onClick={onClose}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Store size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold tracking-wide">TindaPro</span>
              <span className="block text-xs text-slate-400">Store notebook</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigationGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="px-3 text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {group.label}
              </h2>
              <ul className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isReady = item.href === "/overview"
                  const className = cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-emerald-500 font-medium text-white"
                      : "text-slate-300",
                    isReady
                      ? "hover:bg-white/10 hover:text-white"
                      : "cursor-not-allowed opacity-50"
                  )

                  return (
                    <li key={item.href}>
                      {isReady ? (
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={className}
                          onClick={onClose}
                        >
                          <Icon size={17} aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <span
                          aria-disabled="true"
                          title="This section will be added in a later phase."
                          className={className}
                        >
                          <Icon size={17} aria-hidden="true" />
                          <span>{item.label}</span>
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
          One store · One owner
        </div>
      </aside>
    </>
  )
}
