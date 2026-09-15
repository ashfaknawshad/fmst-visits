type IconProps = { className?: string; size?: number; style?: React.CSSProperties };

export function FishIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M8 32c8-14 26-18 38-10 4 2.6 6 6.4 6 10s-2 7.4-6 10c-12 8-30 4-38-10z"
        fill="currentColor"
      />
      <path d="M52 32l10-8v16l-10-8z" fill="currentColor" opacity="0.7" />
      <circle cx="20" cy="28" r="3" fill="var(--surface, #fff)" />
      <circle cx="20.5" cy="28" r="1.4" fill="#0f2a2e" />
      <path
        d="M16 40c4 2 9 3 14 2"
        stroke="var(--surface, #fff)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function TurtleIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="36" rx="20" ry="16" fill="currentColor" />
      <path
        d="M32 22c3 4 3 8 0 12-3-4-3-8 0-12zM20 30c-1 4 0 8 3 11-4-1-7-4-8-8 1-1 3-2 5-3zM44 30c1 4 0 8-3 11 4-1 7-4 8-8-1-1-3-2-5-3z"
        fill="var(--surface, #fff)"
        opacity="0.35"
      />
      <circle cx="14" cy="24" r="5" fill="currentColor" />
      <circle cx="12.5" cy="23" r="1.3" fill="#0f2a2e" />
      <ellipse cx="10" cy="46" rx="4" ry="3" fill="currentColor" opacity="0.85" />
      <ellipse cx="24" cy="52" rx="4" ry="3" fill="currentColor" opacity="0.85" />
      <ellipse cx="40" cy="52" rx="4" ry="3" fill="currentColor" opacity="0.85" />
      <ellipse cx="52" cy="44" rx="4" ry="3" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

export function JellyfishIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M14 26c0-10 8-18 18-18s18 8 18 18c0 4-2 6-4 6H18c-2 0-4-2-4-6z"
        fill="currentColor"
      />
      <circle cx="24" cy="20" r="2" fill="var(--surface, #fff)" opacity="0.6" />
      <circle cx="34" cy="16" r="2" fill="var(--surface, #fff)" opacity="0.6" />
      <path
        d="M20 32c0 8-2 12-2 18M28 32c0 9 2 13 2 20M36 32c0 9-2 13-2 20M44 32c0 8 2 12 2 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function CrabIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="34" rx="16" ry="11" fill="currentColor" />
      <circle cx="24" cy="22" r="4" fill="currentColor" />
      <circle cx="40" cy="22" r="4" fill="currentColor" />
      <circle cx="24" cy="21" r="1.4" fill="#0f2a2e" />
      <circle cx="40" cy="21" r="1.4" fill="#0f2a2e" />
      <path
        d="M10 30c-4-2-7-2-10 0M54 30c4-2 7-2 10 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 44l-8 6M22 48l-5 8M42 48l5 8M50 44l8 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export function BubblesIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="18" cy="40" r="7" fill="currentColor" opacity="0.5" />
      <circle cx="34" cy="22" r="10" fill="currentColor" opacity="0.4" />
      <circle cx="48" cy="42" r="5" fill="currentColor" opacity="0.55" />
      <circle cx="40" cy="14" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function SeaweedIcon({ className, size = 48, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M18 58c-2-10 6-14 4-24-2-10 6-14 4-24"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 58c-2-12 8-16 5-28-3-9 4-13 3-20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M46 58c2-10-6-14-4-24 2-10-6-14-4-22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
