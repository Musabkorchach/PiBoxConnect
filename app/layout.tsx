import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AppWrapper } from "@/components/app-wrapper"
import "./globals.css"

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Pi Box Connect"
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gdi.pi"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: appName,
  description:
    "A secure communication platform that uses your Pi Wallet address as your digital identity.",
  applicationName: appName,
  generator: "Pi Box Connect",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: appName,
    description:
      "Your Pi Wallet. Your Identity. Your Connection.",
    url: appUrl,
    siteName: appName,
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6d3bd6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
