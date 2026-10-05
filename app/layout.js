import './globals.css'
import PWARegister from '@/components/PWARegister'

export const metadata = {
  title: 'folks — borrow from your neighbours',
  description: 'Borrow and lend everyday things with verified neighbours in Arabian Ranches.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'folks',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  themeColor: '#205C49',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
