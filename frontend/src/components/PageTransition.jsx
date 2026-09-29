import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Fades each top-level page (landing, onboarding, dashboard) in on navigation and
// starts it at the top. Keyed by the first path segment, so moving between
// dashboard tabs doesn't remount the shell — Layout animates those itself.
export default function PageTransition({ children }) {
  const { pathname, hash } = useLocation()
  const section = pathname.split('/')[1] || 'home'

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [section, hash])

  return (
    <div key={section} className="page-fade">
      {children}
    </div>
  )
}
