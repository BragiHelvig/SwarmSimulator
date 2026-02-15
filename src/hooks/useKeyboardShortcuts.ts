import { useEffect } from 'react'
import { useSimulation } from '@/store/useSimulationStore'

export function useKeyboardShortcuts() {
  const { state, dispatch } = useSimulation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          dispatch({ type: 'SET_PAUSED', payload: !state.paused })
          break
        case 'KeyV':
          if (state.selectedNodeId != null) {
            dispatch({ type: 'SET_CAMERA_MODE', payload: state.cameraMode === 'node-eye' ? 'free' : 'node-eye' })
          }
          break
        case 'Escape':
          dispatch({ type: 'SELECT_NODE', payload: null })
          dispatch({ type: 'SET_CAMERA_MODE', payload: 'free' })
          break
        case 'Digit1':
          dispatch({ type: 'SET_TIME_SCALE', payload: 0 })
          break
        case 'Digit2':
          dispatch({ type: 'SET_TIME_SCALE', payload: 1 })
          break
        case 'Digit3':
          dispatch({ type: 'SET_TIME_SCALE', payload: 10 })
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, state.paused, state.selectedNodeId, state.cameraMode])
}
