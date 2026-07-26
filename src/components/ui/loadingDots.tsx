import cn from "@/lib/utils/cn";
export const LoadingDots = ({ isFull, className }: { className?: string | null; isFull?: undefined | boolean }) => {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", isFull ? "h-full" : "")}>
      <span className={cn(className ?? "loading-dot w-2.5 h-2.5 rounded-full bg-white")} />
      <span className={cn(className ?? "loading-dot w-2.5 h-2.5 rounded-full bg-white")} />
      <span className={cn(className ?? "loading-dot w-2.5 h-2.5 rounded-full bg-white")} />
    </div>
  );
};
