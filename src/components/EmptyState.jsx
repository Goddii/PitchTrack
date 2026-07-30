export default function EmptyState({icon: Icon, title, message, action }) {

    return(
        <div className="flex flex-col items-center text-center py-16 px-6">
            {Icon && <Icon size={32} className="text-chalk/30 mb-4" strokeWidth={1.5}/>}
            <p className="font-display uppercase tracking-wide text-chalk/70 mb-1"> {title} </p>
            {message && <p className="font-body text-sm text-chalk/45 max-w-sm"> {message} </p>}
            {action && <div className="mt-5"> {action} </div>}

        </div>
    )

}