import { useCallback, useEffect, useEffectEvent, useState } from "react"

/**
 * Run an async loader and track its result without setting state synchronously
 * inside an effect (loading is derived, not stored).
 *
 * - `fn(signal)` returns a promise; forward `signal` to fetch so stale requests abort.
 * - The request re-runs whenever `deps` (compared by JSON value) change or `refetch()` is called.
 * - Previous data stays available while a refetch is in flight (`loading` is true, `hasLoaded` stays true).
 * - `initialData` is only read on the first render, so an inline literal is safe.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fn
 * @param {ReadonlyArray<unknown>} [deps]
 * @param {T} [initialData]
 */
export function useAsync(fn, deps = [], initialData = undefined) {
    const [tick, setTick] = useState(0)
    const [result, setResult] = useState({ key: null, data: initialData, error: null })
    const key = `${JSON.stringify(deps)}#${tick}`
    const run = useEffectEvent(fn)

    useEffect(() => {
        const controller = new AbortController()
        run(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setResult({ key, data, error: null })
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    setResult((prev) => ({ key, data: prev.data, error }))
                }
            })
        return () => controller.abort()
    }, [key])

    const refetch = useCallback(() => setTick((t) => t + 1), [])
    const settled = result.key === key

    return {
        data: result.data,
        error: settled ? result.error : null,
        loading: !settled,
        hasLoaded: result.key !== null,
        refetch,
    }
}
