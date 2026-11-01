'use client'

import { useEffect, useState } from 'react'

// A permanent "Get the app" entry point. Re-opens the install banner for people
// who dismissed it. Hidden when the app is already installed (standalone).
export default function GetAppLink({ className = 'linkish', label = 'Get the app' }) {
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone
    if (standalone) setHide(true)
  }, [])

  if (hide) return null

  function open(e) {
    e.preventDefault()
    window.dispatchEvent(new Event('folks:install'))
  }

  return <a className={className} href="#" onClick={open}>{label}</a>
}
