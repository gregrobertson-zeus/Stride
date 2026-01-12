'use client'

import { useCallback, useRef } from 'react'

export function useCelebration() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    return ctx
  }, [])

  const playDing = useCallback(() => {
    try {
      const ctx = getAudioContext()

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.log('Audio not available:', e)
    }
  }, [getAudioContext])

  const playVictoryFanfare = useCallback(() => {
    try {
      const ctx = getAudioContext()

      // Play a triumphant ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5 to G6
      const baseTime = ctx.currentTime

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.frequency.value = freq
        osc.type = 'sine'

        const startTime = baseTime + i * 0.1
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

        osc.start(startTime)
        osc.stop(startTime + 0.5)
      })

      // Final chord
      const chordNotes = [523.25, 659.25, 783.99] // C major
      const chordTime = baseTime + 0.7

      chordNotes.forEach((freq) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.frequency.value = freq
        osc.type = 'sine'

        gain.gain.setValueAtTime(0, chordTime)
        gain.gain.linearRampToValueAtTime(0.25, chordTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, chordTime + 1.2)

        osc.start(chordTime)
        osc.stop(chordTime + 1.3)
      })
    } catch (e) {
      console.log('Audio not available:', e)
    }
  }, [getAudioContext])

  const createParticles = useCallback((element: HTMLElement, count: number = 24) => {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const colors = ['#FCB612', '#E9490D', '#F7F0E0', '#81b29a', '#fff']

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      const size = 4 + Math.random() * 6
      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
      `
      document.body.appendChild(particle)

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const velocity = 100 + Math.random() * 100
      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity - 20

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 30}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 500 + Math.random() * 300,
        easing: 'cubic-bezier(0, 0.8, 0.2, 1)'
      }).onfinish = () => particle.remove()
    }
  }, [])

  const createMegaParticles = useCallback(() => {
    const colors = ['#FCB612', '#E9490D', '#F7F0E0', '#81b29a', '#fff', '#ff6b6b', '#4ecdc4']
    const particleCount = 100

    // Explosion from center of screen
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      const size = 6 + Math.random() * 10
      const isSquare = Math.random() > 0.7

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${isSquare ? '2px' : '50%'};
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 ${size}px ${colors[Math.floor(Math.random() * colors.length)]};
      `
      document.body.appendChild(particle)

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5)
      const velocity = 200 + Math.random() * 300
      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1.5) rotate(180deg)', opacity: 1, offset: 0.1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(720deg)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0, 0.8, 0.2, 1)',
        delay: Math.random() * 100
      }).onfinish = () => particle.remove()
    }

    // Add a flash overlay
    const flash = document.createElement('div')
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle, rgba(252,182,18,0.3) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9998;
    `
    document.body.appendChild(flash)

    flash.animate([
      { opacity: 0 },
      { opacity: 1, offset: 0.1 },
      { opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => flash.remove()
  }, [])

  const celebrate = useCallback((element?: HTMLElement | null) => {
    console.log('Celebrating!', element)
    playDing()
    if (element) {
      createParticles(element)
    }
  }, [playDing, createParticles])

  const megaCelebrate = useCallback(() => {
    console.log('MEGA CELEBRATION!')
    playVictoryFanfare()
    createMegaParticles()
  }, [playVictoryFanfare, createMegaParticles])

  return { celebrate, megaCelebrate }
}
