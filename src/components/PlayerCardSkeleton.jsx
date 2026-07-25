export default function PlayerCardSkeleton() {
    return (
        <div className="bg-pitch/20 border border-line rounded-lg p-5 flex flex-col items-center animate-pulse" aria-hidden="true">
            <div className="w-16 h-16 rounded-full bg-line/40 mb-3"/>
            <div className="h-4 w-24 bg-line/40 rounded mb-2"/>
            <div className="h3 w-20 bg-line/30 rounded mb-1.5"/>
            <div className="h-3 w-16 bg-line/20 rounded"/>
        </div>
    )
}