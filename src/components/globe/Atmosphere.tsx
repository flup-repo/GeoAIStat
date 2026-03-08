import { BackSide } from 'three'

export function Atmosphere() {
  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial color="#61d4ff" side={BackSide} transparent opacity={0.12} />
    </mesh>
  )
}
