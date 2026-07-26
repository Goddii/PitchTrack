export default function MatchCardSkeleton() {
    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0 animate-pulse" aria-hidden="true">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-line/40"/>
                <div className="h-3 w-20 bg-line/40 rounded"/>
                <div className="h-3 w-5 bg-line/30 rounded"/>
                <div className="h-3 w-20 bg-line/40 rounded"/>
                <div className="w-7 h-7 rounded-full bg-line/40"/>
            </div>
            <div className="h-3 w-16 bg-line/30 rounded"/>

        </div>
    )
}