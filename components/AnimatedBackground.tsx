'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Erstelle 20 schwebende Partikel
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Bewegte Wellen */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-full h-full bg-gradient-to-br from-tournament-yellow/5 via-transparent to-tournament-purple-light/5 animate-wave" />
        <div className="absolute w-full h-full bg-gradient-to-tl from-tournament-purple-light/5 via-transparent to-tournament-yellow/5 animate-wave-reverse" />
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-tournament-yellow/20 animate-float blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}

      {/* Zusätzliche größere schwebende Kreise */}
      <div
        className="absolute rounded-full bg-tournament-purple-light/10 animate-float-slow blur-2xl"
        style={{
          left: '10%',
          top: '20%',
          width: '150px',
          height: '150px',
        }}
      />
      <div
        className="absolute rounded-full bg-tournament-yellow/10 animate-float-slow blur-2xl"
        style={{
          right: '15%',
          top: '60%',
          width: '200px',
          height: '200px',
          animationDelay: '3s',
        }}
      />
      <div
        className="absolute rounded-full bg-tournament-purple-light/10 animate-float-slow blur-2xl"
        style={{
          left: '60%',
          top: '10%',
          width: '120px',
          height: '120px',
          animationDelay: '6s',
        }}
      />

      {/* Sternchen-Effekt */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute text-tournament-yellow/30 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 10 + 8}px`,
            }}
          >
            ✦
          </div>
        ))}
      </div>
    </div>
  )
}
