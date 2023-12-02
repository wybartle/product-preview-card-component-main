import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'


const bodyFont = Montserrat({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Ke Aolama',
  description: 'Ka nūhou ma ka ʻōlelo Hawaiʻi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="%PUBLIC_URL%/keaolama.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
    href="https://fonts.googleapis.com/css2?family=Georgia:opsz,wght@9..144,700&family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap"
    rel="stylesheet"></link>
      </head>
      <body>{children}</body>
    </html>
  )
}
