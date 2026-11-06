import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import "../../styles/global.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`(() => {
  let theme = "system";
  try {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      theme = storedTheme;
    }
  } catch (error) {
    console.warn("Could not read the theme preference from local storage.", error);
  }
  const resolvedTheme = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
})();`}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
