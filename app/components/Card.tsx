import { cn } from "@/app/lib/cn";

export default function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]",
        className
      )}
      {...props}
    />
  );
}
