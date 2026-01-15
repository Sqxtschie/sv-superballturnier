'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface FloatingLinesProps {
  lineColor?: string
  backgroundColor?: string
  speed?: number
  lineCount?: number
  opacity?: number
}

export default function FloatingLines({
  lineColor = '#F4D03F',
  backgroundColor = 'transparent',
  speed = 0.3,
  lineCount = 15,
  opacity = 0.08
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup - moved further back for more subtle effect
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 80

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    if (backgroundColor !== 'transparent') {
      renderer.setClearColor(new THREE.Color(backgroundColor), 1)
    } else {
      renderer.setClearColor(0x000000, 0)
    }

    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create floating lines - more spread out and subtle
    const lines: {
      line: THREE.Line
      velocity: THREE.Vector3
      amplitude: number
      frequency: number
      phase: number
    }[] = []

    const color = new THREE.Color(lineColor)

    for (let i = 0; i < lineCount; i++) {
      const points: THREE.Vector3[] = []
      const segments = 80

      for (let j = 0; j <= segments; j++) {
        points.push(new THREE.Vector3(
          (j / segments) * 200 - 100,
          0,
          0
        ))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity + Math.random() * 0.05
      })

      const line = new THREE.Line(geometry, material)

      // Random initial position - more spread out
      line.position.y = (Math.random() - 0.5) * 120
      line.position.z = (Math.random() - 0.5) * 60
      line.rotation.z = (Math.random() - 0.5) * 0.3

      scene.add(line)

      lines.push({
        line,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005 * speed,
          (Math.random() - 0.5) * 0.008 * speed,
          (Math.random() - 0.5) * 0.003 * speed
        ),
        amplitude: 3 + Math.random() * 5,
        frequency: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2
      })
    }

    // Mouse interaction - very subtle
    const mouse = new THREE.Vector2(0, 0)
    const targetMouse = new THREE.Vector2(0, 0)

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation - slower and more gentle
    let time = 0

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      time += 0.008 * speed

      // Very smooth mouse following
      mouse.x += (targetMouse.x - mouse.x) * 0.02
      mouse.y += (targetMouse.y - mouse.y) * 0.02

      lines.forEach((lineData) => {
        const { line, velocity, amplitude, frequency, phase } = lineData
        const positions = line.geometry.attributes.position
        const posArray = positions.array as Float32Array

        // Animate each point in the line - gentle waves
        for (let i = 0; i <= 80; i++) {
          const x = (i / 80) * 200 - 100
          const waveOffset = Math.sin(x * frequency + time + phase) * amplitude
          const mouseInfluence = Math.sin(x * 0.02 + time * 0.3) * mouse.y * 2

          posArray[i * 3] = x
          posArray[i * 3 + 1] = waveOffset + mouseInfluence
          posArray[i * 3 + 2] = Math.cos(x * frequency * 0.3 + time * 0.3 + phase) * amplitude * 0.2
        }

        positions.needsUpdate = true

        // Move the line very slowly
        line.position.y += velocity.y
        line.position.z += velocity.z
        line.rotation.z += velocity.x * 0.05

        // Wrap around - larger bounds
        if (line.position.y > 70) line.position.y = -70
        if (line.position.y < -70) line.position.y = 70
        if (line.position.z > 40) line.position.z = -40
        if (line.position.z < -40) line.position.z = 40
      })

      // Very subtle camera movement
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.01
      camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.01
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight

      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }

      lines.forEach(({ line }) => {
        line.geometry.dispose()
        ;(line.material as THREE.LineBasicMaterial).dispose()
        scene.remove(line)
      })

      renderer.dispose()

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [lineColor, backgroundColor, speed, lineCount, opacity])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
