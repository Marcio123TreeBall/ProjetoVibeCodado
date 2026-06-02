import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Refúgio',
  description: 'Um espaço íntimo para memórias, fotos e poemas.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="light-mode">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}