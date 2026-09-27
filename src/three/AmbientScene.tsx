import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ambient bokeh layer.
 *
 * This is the WebGL layer, and it is deliberately the smallest thing that
 * earns a render loop. It draws a handful of large, very soft, warm discs that
 * drift and parallax with the pointer — read as lens bokeh thrown by the
 * fireplace and the low sun already in the footage.
 *
 * Why this and not the obvious alternatives:
 *   - It is optically motivated. Glowing sci-fi particles were explicitly
 *     ruled out; bokeh is what a real lens does with those light sources.
 *   - It adds genuine depth over flat video — parallax at several z-depths is
 *     something a video and a CSS gradient cannot fake.
 *   - It holds no content. Nothing here is text, nothing is interactive, so
 *     nothing is lost when it does not render.
 *
 * It mounts only at the 'full' tier, so reduce-motion, Save-Data, phones and
 * weak GPUs never pay for it.
 */

const COUNT = 20

// Palette, straight from tokens.css — gold, gold-soft, wood-light, olive.
const COLORS = ['#d9a855', '#ebc98d', '#8e6845', '#7f8f5e'] as const

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Soft radial falloff. pow() keeps the core small and the edge very gradual,
// which is what stops it reading as a hard glowing dot.
const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 2.6);
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`

interface Mote {
  readonly position: [number, number, number]
  readonly scale: number
  readonly color: string
  readonly opacity: number
  readonly driftSpeed: number
  readonly driftRadius: number
  readonly phase: number
}

function createMotes(): Mote[] {
  // Deterministic pseudo-random: the same arrangement every load, so the
  // composition can be judged and tuned rather than rolling the dice.
  let seed = 20260905
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  return Array.from({ length: COUNT }, () => {
    const depth = -2 - random() * 8
    return {
      position: [
        (random() - 0.5) * 14,
        (random() - 0.5) * 8,
        depth,
      ] as [number, number, number],
      // Further away reads larger here, mimicking an out-of-focus background.
      scale: 0.5 + random() * 1.9,
      color: COLORS[Math.floor(random() * COLORS.length)] as string,
      opacity: 0.07 + random() * 0.13,
      driftSpeed: 0.04 + random() * 0.07,
      driftRadius: 0.25 + random() * 0.5,
      phase: random() * Math.PI * 2,
    }
  })
}

function Motes() {
  const group = useRef<THREE.Group>(null)
  const motes = useMemo(() => createMotes(), [])
  const { viewport } = useThree()

  // One geometry shared by every mote; each gets its own material only because
  // colour and opacity differ. Both are disposed by R3F on unmount.
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const materials = useMemo(
    () =>
      motes.map(
        (mote) =>
          new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            uniforms: {
              uColor: { value: new THREE.Color(mote.color) },
              uOpacity: { value: mote.opacity },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [motes],
  )

  const target = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (!group.current) return

    // Pointer parallax plus a slow scroll offset, both heavily damped.
    // The scroll term is what makes the field read as sitting in front of the
    // page rather than pinned to it: scrolling shifts the bokeh at a different
    // rate to the content, which is exactly what a real foreground layer does.
    // scrollY is a plain property read — no forced layout.
    const scroll =
      typeof window === 'undefined'
        ? 0
        : window.scrollY / Math.max(1, window.innerHeight)

    target.current.x = state.pointer.x * 0.45
    target.current.y = state.pointer.y * 0.28 + scroll * 0.9
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      target.current.x,
      2.2,
      delta,
    )
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      target.current.y,
      2.2,
      delta,
    )

    // Slow independent drift so the field never looks like a rigid grid.
    const time = state.clock.elapsedTime
    group.current.children.forEach((child, index) => {
      const mote = motes[index]
      if (!mote) return
      child.position.x =
        mote.position[0] +
        Math.cos(time * mote.driftSpeed + mote.phase) * mote.driftRadius
      child.position.y =
        mote.position[1] +
        Math.sin(time * mote.driftSpeed * 0.8 + mote.phase) * mote.driftRadius
    })
  })

  // Keep the field covering the viewport at any aspect ratio.
  const spread = Math.max(1, viewport.width / 10)

  return (
    <group ref={group} scale={[spread, spread, 1]}>
      {motes.map((mote, index) => (
        <mesh
          key={index}
          position={mote.position}
          scale={mote.scale}
          geometry={geometry}
          material={materials[index]}
        />
      ))}
    </group>
  )
}

export default function AmbientScene() {
  return (
    <Canvas
      className="pointer-events-none"
      // Cap DPR: this layer is pure soft gradient, retina detail buys nothing
      // and costs 4x the fragments.
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Motes />
    </Canvas>
  )
}
