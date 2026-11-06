"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { useCurrentDate } from "@/hooks/use-current-date"

const pageTitles: Readonly<Record<string, string>> = {
  "/overview": "Overview",
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()
  const currentDate = useCurrentDate()
  const pageTitle = pageTitles[pathname] ?? "TindaPro"

  return (
    <div className="min-h-svh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-svh md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {pageTitle}
              </p>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                {currentDate}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
