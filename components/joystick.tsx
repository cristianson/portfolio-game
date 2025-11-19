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
    setActive(true)
    const touch = 'touches' in e ? e.touches[0] : e as unknown as React.Touch
    if ('touches' in e) touchId.current = touch.identifier
  }

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!joystickRef.current || !knobRef.current) return

    
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

    const knobWidth = knobRef.current.offsetWidth
    const maxRadius = (rect.width - knobWidth) / 2

    let dx = clientX - centerX
    let dy = clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx)
      dx = Math.cos(angle) * maxRadius
      dy = Math.sin(angle) * maxRadius
    }

    knobRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    
    // Normalize output -1 to 1
    onMove(dx / maxRadius, dy / maxRadius)
  }, [onMove])

  const handleEnd = useCallback(() => {
    setActive(false)
    touchId.current = null
    
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(-50%, -50%)`
    }
    
    onStop()
  }, [onStop])

  useEffect(() => {
    if (active) {
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
      <div 
        ref={knobRef}
        className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  )
}
