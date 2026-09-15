export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 20c33 12 67 12 100 0s67-12 100 0 67 12 100 0 67-12 100 0v20H0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WaveHero({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M0 40c50 24 100 24 150 6s100-18 150 0 60 18 100 6V120H0z"
          className="fill-ocean-200 dark:fill-ocean-800"
        />
        <path
          d="M0 60c50 20 100 20 150 4s100-14 150 2 60 14 100 4V120H0z"
          className="fill-ocean-300 dark:fill-ocean-700"
          opacity="0.8"
        />
        <path
          d="M0 80c50 16 100 16 150 2s100-10 150 2 60 10 100 2V120H0z"
          className="fill-ocean-400 dark:fill-ocean-600"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
