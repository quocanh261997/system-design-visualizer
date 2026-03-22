import { useEffect } from 'react'

/** Runs an effect on mount (production: once; development Strict Mode may double-invoke). */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}
