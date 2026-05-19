import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alaska 2026 — Family Trip Planning",
  description: "Browse, vote, and converge on plans for our 16 days in Alaska, June 17 – July 2, 2026.",
};

export const viewport: Viewport = {
  themeColor: "#FAF6EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              toast: "!bg-paper !border-edge !text-ink !font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
