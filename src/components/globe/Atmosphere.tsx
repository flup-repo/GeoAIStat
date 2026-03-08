import { useMemo } from 'react'
import { AdditiveBlending, BackSide, Color, FrontSide, ShaderMaterial } from 'three'

/**
 * A cinematic atmosphere combining an outer glowing halo and an inner rim light.
 * The inner glow hugs the sphere geometry closely, while the outer glow
 * creates the diffuse ring around the planet.
 */

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export function Atmosphere() {
  const outerMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        // The outer glow drops off fast at the edges to simulate atmospheric scattering 
        // viewed across the limb of the planet.
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(max(0.0, 0.7 - dot(vNormal, vec3(0, 0, 1.0))), 4.0);
            gl_FragColor = vec4(uColor, 1.0) * intensity * uOpacity;
          }
        `,
        uniforms: {
          uColor: { value: new Color('#2dbbf1') },
          uOpacity: { value: 1.0 },
        },
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  const innerMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        // The inner glow creates a soft rim light right along the surface.
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(max(0.0, 1.0 - dot(vNormal, vec3(0, 0, 1.0))), 3.4);
            gl_FragColor = vec4(uColor, 1.0) * intensity * uOpacity;
          }
        `,
        uniforms: {
          uColor: { value: new Color('#56dbff') },
          uOpacity: { value: 0.6 },
        },
        side: FrontSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  return (
    <group>
      <mesh scale={1.12} material={outerMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh scale={1.002} material={innerMaterial}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  )
}
