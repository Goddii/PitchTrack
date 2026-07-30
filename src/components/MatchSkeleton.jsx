import { memo } from "react"

function MatchSkeleton({ variant = "card" }) {
  if (variant === "card") {
    return (
      <div
        className="rounded-xl bg-glass-bg border border-glass-border p-5 sweep-shimmer"
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-line/20" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-line/20 rounded" />
                <div className="h-2 w-16 bg-line/10 rounded" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 px-4">
            <div className="h-6 w-16 bg-line/20 rounded" />
            <div className="h-4 w-12 bg-line/15 rounded-full" />
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-3">
              <div className="space-y-2 text-right">
                <div className="h-3 w-24 bg-line/20 rounded ml-auto" />
                <div className="h-2 w-16 bg-line/10 rounded ml-auto" />
              </div>
              <div className="w-10 h-10 rounded-full bg-line/20" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-glass-border">
          <div className="h-3 w-32 bg-line/15 rounded" />
          <div className="h-3 w-12 bg-line/15 rounded" />
        </div>
      </div>
    )
  }

  // Hero skeleton
  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] rounded-2xl bg-black/50 sweep-shimmer"
      aria-hidden="true"
    >
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
        <div className="h-3 w-32 bg-line/20 rounded" />
        <div className="flex items-center gap-8">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-line/20" />
            <div className="h-4 w-28 bg-line/20 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-12 w-20 bg-line/20 rounded" />
            <div className="h-4 w-16 bg-line/15 rounded" />
          </div>
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-line/20" />
            <div className="h-4 w-28 bg-line/20 rounded" />
          </div>
        </div>
        <div className="h-3 w-48 bg-line/15 rounded" />
      </div>
    </div>
  )
}

export default memo(MatchSkeleton)
