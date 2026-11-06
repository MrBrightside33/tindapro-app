"use client"

import * as React from "react"

function subscribe(): () => void {
  return () => {}
}

function getSnapshot(): string {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())
}

function getServerSnapshot(): string {
  return ""
}

export function useCurrentDate(): string {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
