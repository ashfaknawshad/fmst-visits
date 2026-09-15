export function WaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="currentColor" opacity="0.15" />
      <path
        d="M6 14c2.5 3 5.5 3 8 0s5.5-3 8 0 5.5 3 8 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 20c2.5 3 5.5 3 8 0s5.5-3 8 0 5.5 3 8 0"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
