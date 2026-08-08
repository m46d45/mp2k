import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-elevated text-muted",
        m: "border-mode-m/30 bg-mode-m/15 text-mode-m",
        n: "border-mode-n/30 bg-mode-n/15 text-mode-n",
        f: "border-mode-f/30 bg-mode-f/15 text-mode-f",
        success: "border-success/30 bg-success/15 text-success",
        warn: "border-warn/30 bg-warn/15 text-warn",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
