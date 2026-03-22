import { useState } from 'react'
import { useMountEffect } from './use-mount-effect'

/** Tracks whether Space is held down for pan-mode toggling on canvas components. */
export function useSpacePan(): boolean {
  const [isSpacePressed, setIsSpacePressed] = useState(false)

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target
        if (!(target instanceof HTMLElement)) return
        if (target.isContentEditable ||
          !!target.closest('input, textarea, button, select, a[href], [contenteditable="true"], [role="button"], [role="textbox"]')
        ) return
        e.preventDefault()
        setIsSpacePressed(true)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false)
    }
    const onBlur = () => setIsSpacePressed(false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  })

  return isSpacePressed
}
