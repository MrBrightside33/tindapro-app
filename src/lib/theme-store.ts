export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = Exclude<Theme, "system">

export interface ThemeSnapshot {
  theme: Theme
  resolvedTheme: ResolvedTheme
}

const serverSnapshot: ThemeSnapshot = {
  theme: "system",
  resolvedTheme: "light",
}

const storageKey = "theme"
const listeners = new Set<() => void>()

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getStoredTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(storageKey)
    return isTheme(storedTheme) ? storedTheme : "system"
  } catch (error) {
    console.warn("Could not read the theme preference from local storage.", error)
    return "system"
  }
}

function createSnapshot(theme: Theme): ThemeSnapshot {
  return {
    theme,
    resolvedTheme: theme === "system" ? getSystemTheme() : theme,
  }
}

let snapshot =
  typeof window === "undefined"
    ? serverSnapshot
    : createSnapshot(getStoredTheme())

function notifyListeners(): void {
  for (const listener of listeners) {
    listener()
  }
}

function updateTheme(theme: Theme): void {
  snapshot = createSnapshot(theme)
  document.documentElement.classList.toggle(
    "dark",
    snapshot.resolvedTheme === "dark"
  )
  document.documentElement.style.colorScheme = snapshot.resolvedTheme
  notifyListeners()
}

function handleSystemThemeChange(): void {
  if (snapshot.theme === "system") {
    updateTheme("system")
  }
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== storageKey && event.key !== null) {
    return
  }

  updateTheme(isTheme(event.newValue) ? event.newValue : "system")
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleSystemThemeChange)
    window.addEventListener("storage", handleStorage)
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleSystemThemeChange)
      window.removeEventListener("storage", handleStorage)
    }
  }
}

export function getThemeSnapshot(): ThemeSnapshot {
  return snapshot
}

export function getServerThemeSnapshot(): ThemeSnapshot {
  return serverSnapshot
}

export function setTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(storageKey, theme)
  } catch (error) {
    console.warn("Could not save the theme preference in local storage.", error)
  }

  updateTheme(theme)
}
