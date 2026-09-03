/**
 * Inline SVG icons (Lucide geometry, 24px grid).
 *
 * Inlined rather than pulled from an icon package: the set is small, it costs
 * nothing at runtime, and it keeps the dependency list short. Icons are
 * decorative here — every control carries its own accessible name — so they are
 * aria-hidden and the parent button supplies the label.
 */
type IconProps = { className?: string };

function Svg({ children, className = "h-4 w-4" }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const BoldIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" /></Svg>
);
export const ItalicIcon = (p: IconProps) => (
  <Svg {...p}><path d="M19 4h-9M14 20H5M15 4 9 20" /></Svg>
);
export const UnderlineIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16" /></Svg>
);
export const BulletListIcon = (p: IconProps) => (
  <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>
);
export const OrderedListIcon = (p: IconProps) => (
  <Svg {...p}><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3a1 1 0 0 0-2 0" /></Svg>
);
export const QuoteIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 17h3l2-4V7H5v6h3zM15 17h3l2-4V7h-6v6h3z" /></Svg>
);
export const UndoIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></Svg>
);
export const RedoIcon = (p: IconProps) => (
  <Svg {...p}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></Svg>
);
export const PlusIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const UploadIcon = (p: IconProps) => (
  <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></Svg>
);
export const ShareIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></Svg>
);
export const DocumentIcon = (p: IconProps) => (
  <Svg {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5" /></Svg>
);
export const UsersIcon = (p: IconProps) => (
  <Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></Svg>
);
export const LockIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
);
export const EyeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const PencilIcon = (p: IconProps) => (
  <Svg {...p}><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="m15 18-6-6 6-6" /></Svg>
);
export const AlertIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Svg>
);
export const SpinnerIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${className} animate-spin`} aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);
