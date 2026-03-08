export type SceneQuality = {
  webgl: boolean
  reducedMotion: boolean
  autoRotate: boolean
  starsCount: number
}

export function detectSceneQuality(): SceneQuality {
  if (typeof window === 'undefined') {
    return {
      webgl: true,
      reducedMotion: false,
      autoRotate: true,
      starsCount: 4200,
    }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canvas = document.createElement('canvas')
  const webgl =
    Boolean(canvas.getContext('webgl')) || Boolean(canvas.getContext('experimental-webgl'))

  return {
    webgl,
    reducedMotion,
    autoRotate: webgl && !reducedMotion,
    starsCount: reducedMotion ? 1600 : 4200,
  }
}
