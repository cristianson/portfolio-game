/**
 * Joystick Component
 *
 * A touch-friendly virtual joystick for mobile devices.
 * It captures touch/mouse events to calculate a normalized direction vector (x, y)
 * which is passed up to the game loop for player movement.
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

interface JoystickProps {
  onMove: (x: number, y: number) => void
  onStop: () => void
}

export function Joystick({ onMove, onStop }: JoystickProps) {
  const [active, setActive] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  // The finger driving the joystick; other fingers (e.g. dragging the camera) are ignored
  const touchId = useRef<number | null>(null)

  const updateFrom = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current || !knobRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate the maximum distance the knob center can travel
    // This is: (container radius) - (knob radius)
    // So the knob edge touches the container edge at max
    const containerRadius = rect.width / 2
    const knobRadius = knobRef.current.offsetWidth / 2
    const maxRadius = containerRadius - knobRadius

    let dx = clientX - centerX
    let dy = clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Clamp the distance so the knob stays within the circular boundary
    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx)
      dx = Math.cos(angle) * maxRadius
      dy = Math.sin(angle) * maxRadius
    }

    // Apply transform - since knob is centered with inset-0 m-auto,
    // we only need to translate by the offset amount (no -50% needed)
    knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`

    // Normalize output to -1 to 1 range
    const normalizedX = maxRadius > 0 ? dx / maxRadius : 0
    const normalizedY = maxRadius > 0 ? dy / maxRadius : 0
    onMove(normalizedX, normalizedY)
  }, [onMove])

  const handleEnd = useCallback(() => {
    setActive(false)
    touchId.current = null

    if (knobRef.current) {
      // Reset knob to center position
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }

    onStop()
  }, [onStop])

  // Touch start is attached natively: React registers touch listeners as passive,
  // which would make preventDefault (no scroll / zoom while steering) throw a warning
  useEffect(() => {
    const el = joystickRef.current
    if (!el) return
    const start = (e: TouchEvent) => {
      e.preventDefault()
      if (touchId.current !== null) return
      const touch = e.changedTouches[0]
      touchId.current = touch.identifier
      setActive(true)
      updateFrom(touch.clientX, touch.clientY)
    }
    el.addEventListener('touchstart', start, { passive: false })
    return () => el.removeEventListener('touchstart', start)
  }, [updateFrom])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault()
    setActive(true)
    updateFrom(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (!active) return
    const ownTouch = (list: TouchList) => Array.from(list).find(t => t.identifier === touchId.current)
    const touchMove = (e: TouchEvent) => {
      const touch = ownTouch(e.touches)
      if (!touch) return
      // Prevent scrolling while using joystick
      e.preventDefault()
      updateFrom(touch.clientX, touch.clientY)
    }
    // Only our own finger lifting (or the OS cancelling it) releases the stick
    const touchEnd = (e: TouchEvent) => {
      if (ownTouch(e.changedTouches)) handleEnd()
    }
    const mouseMove = (e: MouseEvent) => {
      if (touchId.current !== null) return
      if (e.buttons === 0) handleEnd()
      else updateFrom(e.clientX, e.clientY)
    }
    const mouseUp = () => {
      if (touchId.current === null) handleEnd()
    }
    window.addEventListener('touchmove', touchMove, { passive: false })
    window.addEventListener('touchend', touchEnd)
    window.addEventListener('touchcancel', touchEnd)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
    // Losing the page (app switch, notification) also lets go
    window.addEventListener('blur', handleEnd)
    return () => {
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', touchEnd)
      window.removeEventListener('touchcancel', touchEnd)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', mouseUp)
      window.removeEventListener('blur', handleEnd)
    }
  }, [active, updateFrom, handleEnd])

  return (
    <div 
      ref={joystickRef}
      className={`relative w-32 h-32 bg-black/30 rounded-full backdrop-blur-sm border-2 border-white/20 touch-none transition-opacity ${active ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
      onMouseDown={handleMouseDown}
    >
      {/* 
        Knob positioning explained:
        - absolute + inset-0: makes the knob fill the parent area
        - m-auto: centers the knob both horizontally and vertically
        - This centering method doesn't use transform, so our JS transform 
          only needs to handle the dx/dy offset without any -50% calc
      */}
      <div 
        ref={knobRef}
        className="absolute inset-0 m-auto w-12 h-12 bg-white/80 rounded-full shadow-lg pointer-events-none"
        style={{ transform: 'translate(0px, 0px)' }}
      />
    </div>
  )
}

