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
  const touchId = useRef<number | null>(null)
  
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to avoid text selection and scrolling issues
    e.preventDefault()
    setActive(true)
    const touch = 'touches' in e ? e.touches[0] : e as unknown as React.Touch
    if ('touches' in e) touchId.current = touch.identifier
  }

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!joystickRef.current || !knobRef.current) return
    
    // Prevent scrolling while using joystick
    e.preventDefault()
    
    let clientX, clientY
    if ('touches' in e) {
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current)
      if (!touch) return
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      if ((e as MouseEvent).buttons === 0) {
        handleEnd()
        return
      }
      clientX = (e as MouseEvent).clientX
      clientY = (e as MouseEvent).clientY
    }

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

  useEffect(() => {
    if (active) {
      // Use { passive: false } to allow preventDefault on touch events
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleEnd)
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)
    }
    return () => {
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [active, handleMove, handleEnd])

  return (
    <div 
      ref={joystickRef}
      className={`relative w-32 h-32 bg-black/30 rounded-full backdrop-blur-sm border-2 border-white/20 touch-none transition-opacity ${active ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
      onTouchStart={handleStart}
      onMouseDown={handleStart}
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

