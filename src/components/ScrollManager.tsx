import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

interface ScrollPosition {
  left: number
  top: number
}

const RESTORE_TIMEOUT_MS = 5_000

function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map<string, ScrollPosition>())
  const currentLocationKey = useRef(location.key)
  const restoring = useRef(false)

  useEffect(() => {
    const previousSetting = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousSetting
    }
  }, [])

  useEffect(() => {
    function recordPosition() {
      if (restoring.current) {
        return
      }

      positions.current.set(currentLocationKey.current, {
        left: window.scrollX,
        top: window.scrollY,
      })
    }

    window.addEventListener('scroll', recordPosition, { passive: true })
    return () => window.removeEventListener('scroll', recordPosition)
  }, [])

  useLayoutEffect(() => {
    const locationKey = location.key
    currentLocationKey.current = locationKey

    if (navigationType === 'REPLACE') {
      positions.current.set(locationKey, {
        left: window.scrollX,
        top: window.scrollY,
      })
      return
    }

    const savedPosition =
      navigationType === 'POP' ? positions.current.get(locationKey) : undefined
    const target = savedPosition ?? { left: 0, top: 0 }

    if (target.top === 0) {
      restoring.current = true
      window.scrollTo(target.left, target.top)
      positions.current.set(locationKey, target)
      restoring.current = false
      return
    }

    restoring.current = true
    let completed = false
    let frameId = 0
    let timeoutId = 0

    function finishRestoration() {
      if (completed) {
        return
      }

      completed = true
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
      observer.disconnect()
      positions.current.set(locationKey, {
        left: window.scrollX,
        top: window.scrollY,
      })
      restoring.current = false
    }

    function attemptRestoration() {
      frameId = 0
      const maximumTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      )

      window.scrollTo(target.left, Math.min(target.top, maximumTop))

      if (maximumTop >= target.top - 1) {
        finishRestoration()
      }
    }

    function scheduleRestoration() {
      if (!completed && frameId === 0) {
        frameId = window.requestAnimationFrame(attemptRestoration)
      }
    }

    const observer = new ResizeObserver(scheduleRestoration)
    observer.observe(document.documentElement)
    scheduleRestoration()

    timeoutId = window.setTimeout(() => {
      attemptRestoration()
      finishRestoration()
    }, RESTORE_TIMEOUT_MS)

    return finishRestoration
  }, [location.key, navigationType])

  return null
}

export default ScrollManager
