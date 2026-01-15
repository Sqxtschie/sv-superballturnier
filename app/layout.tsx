import './globals.css'
import type { Metadata } from 'next'
import FloatingLines from '@/components/FloatingLines'

export const metadata: Metadata = {
  title: 'SV Superballturnier 2026',
  description: 'Turnierbaum für das Superballturnier 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="tournament-bg">
        <FloatingLines
          lineColor="#F4D03F"
          speed={0.4}
          lineCount={12}
          opacity={0.06}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
