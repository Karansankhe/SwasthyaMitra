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
  inventory: make(
    <>
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5Z" />
      <path d="M2 5l6 3 6-3M8 8v6" />
    </>,
  ),
  lms: make(
    <>
      <path d="M8 2.5 14.5 6 8 9.5 1.5 6 8 2.5Z" />
      <path d="M4 7.5v3.5c0 .8 1.8 2 4 2s4-1.2 4-2V7.5" />
    </>,
  ),
  pulse: make(<path d="M1.5 8.5h3l1.5-4 2.5 8 2-5.5 1 1.5h3" />),
  truck: make(
    <>
      <path d="M1.5 4h8v7h-8Z" />
      <path d="M9.5 6.5h2.8l2.2 2.4V11h-5" />
      <circle cx="4.5" cy="12" r="1.3" fill="#111312" />
      <circle cx="11.5" cy="12" r="1.3" fill="#111312" />
    </>,
  ),
  chat: make(
    <>
      <path d="M2.5 3.5h11v7.5H8l-3 2.5V11H2.5Z" />
      <path d="M5.5 7.2h.01M8 7.2h.01M10.5 7.2h.01" strokeWidth="2" />
    </>,
  ),
}
