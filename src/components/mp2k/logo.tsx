import { cn } from "@/lib/utils";

/** Concept C — MP monogram + production flow wave */
export function Mp2kMark({ className, title = "MP2K" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="32" height="32" rx="7" fill="currentColor" className="text-fg" />
      <path
        d="M7.2 23.2V9.1h2.55l3.35 9.35L16.45 9.1H19V23.2h-2.35v-9.4l-2.95 8.05h-1.5L9.25 13.8v9.4H7.2z"
        fill="var(--color-bg, #fafafa)"
      />
      <path
        d="M8.2 25.6c1.6-.9 2.7-.9 4.2 0 1.5.9 2.6.9 4.2 0 1.5-.9 2.7-.9 4.2 0"
        fill="none"
        stroke="var(--color-bg, #fafafa)"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M22.4 24.6l2.2 1.05-2.2 1.05"
        fill="none"
        stroke="var(--color-bg, #fafafa)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Mp2kLogo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Mp2kMark className="size-9" />
      {showWordmark ? (
        <div className="min-w-0 leading-tight">
          <div className="font-mono text-sm font-semibold tracking-tight text-fg">MP2K</div>
          <div className="hidden text-[11px] text-muted sm:block">Multi-Moda Produksi</div>
        </div>
      ) : null}
    </div>
  );
}
