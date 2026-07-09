export type Tier = 0 | 1 | 2 | 3

export interface QualityProfile {
  dprMax: number
  rainCount: number
  reflectorRes: number
  bloom: boolean
  chromatic: boolean
  dof: boolean
  glitch: boolean
  cloudSegments: number
  starCount: number
}

export function tierFrom(
  gpuTier: number | undefined,
  deviceMemoryGb: number | undefined,
  isMobile: boolean,
): Tier {
  if (gpuTier === 0) return 0
  let t: Tier = gpuTier === undefined ? 1 : gpuTier >= 3 ? 3 : gpuTier === 2 ? 2 : 1
  if (isMobile && t > 2) t = 2
  if (deviceMemoryGb !== undefined && deviceMemoryGb <= 2 && t > 1) t = 1
  return t
}

export function profileFor(tier: Tier, isMobile: boolean): QualityProfile {
  const high: QualityProfile = {
    dprMax: 2,
    rainCount: 9000,
    reflectorRes: 1024,
    bloom: true,
    chromatic: true,
    dof: true,
    glitch: true,
    cloudSegments: 26,
    starCount: 4000,
  }
  switch (tier) {
    case 3:
      return { ...high, dprMax: isMobile ? 1.5 : 2 }
    case 2:
      return { ...high, dprMax: isMobile ? 1.5 : 1.75, rainCount: 4500, reflectorRes: 512, dof: false, cloudSegments: 16, starCount: 2500 }
    case 1:
      return { ...high, dprMax: isMobile ? 1.25 : 1.5, rainCount: 1800, reflectorRes: 256, chromatic: false, dof: false, glitch: false, cloudSegments: 8, starCount: 1200 }
    case 0:
      return { ...high, dprMax: 1, rainCount: 0, reflectorRes: 0, bloom: false, chromatic: false, dof: false, glitch: false, cloudSegments: 0, starCount: 0 }
  }
}
