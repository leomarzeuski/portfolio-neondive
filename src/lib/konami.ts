export const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'] as const

export function createKonami(onUnlock: () => void): (e: { key: string }) => void {
  let i = 0
  return (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if (key === KONAMI[i]) {
      i += 1
      if (i === KONAMI.length) {
        i = 0
        onUnlock()
      }
    } else {
      i = key === KONAMI[0] ? 1 : 0
    }
  }
}
