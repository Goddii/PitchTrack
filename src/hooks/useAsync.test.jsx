// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { useAsync } from "./useAsync"

afterEach(cleanup)

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe("useAsync", () => {
    it("starts loading with the initial data, then exposes the result", async () => {
        const { result } = renderHook(() => useAsync(() => Promise.resolve(["a"]), [], []))

        expect(result.current.loading).toBe(true)
        expect(result.current.data).toEqual([])
        expect(result.current.hasLoaded).toBe(false)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toEqual(["a"])
        expect(result.current.error).toBeNull()
        expect(result.current.hasLoaded).toBe(true)
    })

    it("surfaces a rejection as error and keeps the previous data on refetch", async () => {
        let calls = 0
        const fn = () => (++calls === 1 ? Promise.resolve("ok") : Promise.reject(new Error("boom")))
        const { result } = renderHook(() => useAsync(fn, []))

        await waitFor(() => expect(result.current.data).toBe("ok"))

        act(() => result.current.refetch())
        await waitFor(() => expect(result.current.error?.message).toBe("boom"))
        expect(result.current.data).toBe("ok")
        expect(result.current.loading).toBe(false)
    })

    it("refetch runs the loader again", async () => {
        let calls = 0
        const { result } = renderHook(() => useAsync(() => Promise.resolve(++calls), []))

        await waitFor(() => expect(result.current.data).toBe(1))
        act(() => result.current.refetch())
        await waitFor(() => expect(result.current.data).toBe(2))
    })

    it("ignores the result of a request superseded by a deps change", async () => {
        const { result, rerender } = renderHook(
            ({ id }) => useAsync(() => wait(id === 1 ? 60 : 5).then(() => id), [id]),
            { initialProps: { id: 1 } }
        )

        rerender({ id: 2 })
        await waitFor(() => expect(result.current.data).toBe(2))

        await wait(100) // the slow id=1 request would resolve by now
        expect(result.current.data).toBe(2)
    })

    it("passes an AbortSignal that is aborted when deps change", async () => {
        const signals = []
        const { rerender } = renderHook(
            ({ id }) =>
                useAsync((signal) => {
                    signals.push(signal)
                    return Promise.resolve(id)
                }, [id]),
            { initialProps: { id: 1 } }
        )

        rerender({ id: 2 })
        await waitFor(() => expect(signals.length).toBeGreaterThanOrEqual(2))
        expect(signals[0].aborted).toBe(true)
    })
})
