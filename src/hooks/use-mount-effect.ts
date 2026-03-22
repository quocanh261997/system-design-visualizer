import { useEffect } from 'react'

/** Runs an effect exactly once on mount. Wrapper around useEffect(fn, []) with explicit intent. */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}
