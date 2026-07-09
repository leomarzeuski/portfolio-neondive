import * as THREE from 'three'

export function createHologramMaterial(color: THREE.ColorRepresentation): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 p = position;
        float band = step(0.96, sin(uTime * 8.0 + position.y * 2.0) * sin(uTime * 3.7));
        p.x += band * 0.35 * sin(uTime * 90.0 + position.y * 40.0);
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = normalize(-mv.xyz);
        vUv = uv;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vView, vNormal)), 1.6);
        float scan = 0.6 + 0.4 * pow(abs(sin(vUv.y * 90.0 - uTime * 2.2)), 4.0);
        float flicker = 0.92 + 0.08 * sin(uTime * 37.0);
        float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x)
                   * smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
        vec3 col = uColor * (0.35 + fresnel * 1.4) * scan * flicker * 2.2;
        gl_FragColor = vec4(col, (0.26 + fresnel * 0.5) * edge);
      }
    `,
  })
}
