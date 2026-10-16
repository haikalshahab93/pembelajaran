/** Ikon inline (SVG) agar tidak menambah dependensi ikon. */

const base = size => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
})

export const IconGrid = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
)

export const IconCards = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect x="3" y="6" width="14" height="13" rx="2.5" />
    <path d="M7 3h11a3 3 0 0 1 3 3v10" />
  </svg>
)

export const IconQuiz = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M9.2 9a3 3 0 1 1 4.3 2.7c-.9.5-1.5 1.2-1.5 2.3" />
    <path d="M12 18h.01" />
    <circle cx="12" cy="12" r="9" />
  </svg>
)

export const IconChat = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
  </svg>
)

export const IconTranslate = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M4 6h10" />
    <path d="M9 4v2c0 4-2.2 7.5-5 9" />
    <path d="M7 12c1.4 2.6 3.6 4.4 6 5" />
    <path d="M13 20l4-9 4 9" />
    <path d="M14.6 17h4.8" />
  </svg>
)

export const IconSearch = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const IconSettings = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.63 15a1.7 1.7 0 0 0-1.55-1H2a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 4.63 1.7 1.7 0 0 0 9 3.08V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
  </svg>
)

export const IconBulb = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.1 1 1.9l.1.8h5l.1-.8c.1-.8.4-1.4 1-1.9A6 6 0 0 0 12 3Z" />
  </svg>
)

export const IconSun = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const IconMoon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
  </svg>
)

export const IconVolume = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="M4 9.5h3.2L12 6v12l-4.8-3.5H4Z" />
    <path d="M16 9.2a4 4 0 0 1 0 5.6" />
    <path d="M18.6 6.6a7.5 7.5 0 0 1 0 10.8" />
  </svg>
)

export const IconStar = ({ size = 17, filled = false }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" />
  </svg>
)

export const IconArrowLeft = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const IconArrowRight = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const IconFlip = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9M20.5 12a8.5 8.5 0 0 1-14.6 5.9" />
    <path d="M18 2.6V6h-3.4M6 21.4V18h3.4" />
  </svg>
)

export const IconX = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconCheck = ({ size = 17 }) => (
  <svg {...base(size)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
)

export const IconCopy = ({ size = 16 }) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </svg>
)

export const IconTrash = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
  </svg>
)

export const IconFlame = ({ size = 15 }) => (
  <svg {...base(size)}>
    <path d="M12 3s5 4 5 8.5A5 5 0 0 1 7 12c0-1.6.7-2.8 1.6-3.8.3 1 .9 1.7 1.7 2 .5-2.6-.3-5.4 1.7-7.2Z" />
    <path d="M12 21a3.4 3.4 0 0 0 3.4-3.4c0-2-1.6-3.2-3.4-5.1-1.8 1.9-3.4 3.1-3.4 5.1A3.4 3.4 0 0 0 12 21Z" />
  </svg>
)

export const IconSparkles = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8Z" />
    <path d="M18.5 15.5 19.3 17.7 21.5 18.5 19.3 19.3 18.5 21.5 17.7 19.3 15.5 18.5 17.7 17.7Z" />
  </svg>
)

export const IconSend = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3 14.5 21l-4-7.5L3 9.5Z" />
  </svg>
)

export const IconDownload = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 3v11" />
    <path d="m7.5 10 4.5 4.5L16.5 10" />
    <path d="M4 20h16" />
  </svg>
)

export const IconUpload = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 15V4" />
    <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
    <path d="M4 20h16" />
  </svg>
)

export const IconTarget = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
)
