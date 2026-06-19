import { cn } from "@/lib/utils";
import { STATUS_TONE, type SubmissionStatus } from "@/lib/mock-data";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  success: "bg-success/10 text-success border-success/20",
  gold: "bg-gold/15 text-gold-foreground border-gold/40",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: SubmissionStatus | string;
  label?: string;
  className?: string;
}) {
  const tone = (STATUS_TONE as Record<string, string>)[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label ?? status}
    </span>
  );
}
