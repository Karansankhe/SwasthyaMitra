// Sidebar line icons. Each inherits `currentColor` from its parent.
function make(children) {
  return function Icon(props) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {children}
      </svg>
    )
  }
}

export const Icons = {
  command: make(
    <>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </>,
  ),
  alerts: make(
    <>
      <path d="M8 2.5c-2 0-3.2 1.4-3.2 3.4 0 2.6-1 3.6-1.3 4h9c-.3-.4-1.3-1.4-1.3-4 0-2-1.2-3.4-3.2-3.4Z" />
      <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" />
    </>,
  ),
  forecast: make(
    <>
      <path d="M2 11l3.5-4 3 2L14 3.5" />
      <path d="M2 14h12" />
    </>,
  ),
  inventory: make(
    <>
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5Z" />
      <path d="M2 5l6 3 6-3M8 8v6" />
    </>,
  ),
  staff: make(
    <>
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4" />
    </>,
  ),
  comms: make(<path d="M2.5 3.5h11v8h-6l-3 2.5v-2.5h-2Z" />),
  sim: make(
    <>
      <path d="M3 4h10M3 8h10M3 12h10" />
      <circle cx="5.5" cy="4" r="1.6" fill="#FFFFFF" />
      <circle cx="10.5" cy="8" r="1.6" fill="#FFFFFF" />
      <circle cx="6.5" cy="12" r="1.6" fill="#FFFFFF" />
    </>,
  ),
  lms: make(
    <>
      <path d="M8 2.5 14.5 6 8 9.5 1.5 6 8 2.5Z" />
      <path d="M4 7.5v3.5c0 .8 1.8 2 4 2s4-1.2 4-2V7.5" />
    </>,
  ),
  settings: make(
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
    </>,
  ),
}
