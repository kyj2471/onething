export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="16" cy="16" r="4" fill="#D9F24A" />
    </svg>
  );
}
