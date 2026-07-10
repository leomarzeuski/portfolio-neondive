export interface CityAudio {
  start(): void
  stop(): void
  setDepth(d: number): void
  whoosh(): void
}

export function createCityAudio(): CityAudio {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let rainGain: GainNode | null = null
  let rainFilter: BiquadFilterNode | null = null
  let humGain: GainNode | null = null
  let nodes: AudioNode[] = []

  function ensure() {
    if (ctx) return
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)

    // chuva: ruído branco em loop → lowpass
    const len = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    rainFilter = ctx.createBiquadFilter()
    rainFilter.type = 'lowpass'
    rainFilter.frequency.value = 700
    rainGain = ctx.createGain()
    rainGain.gain.value = 0
    noise.connect(rainFilter).connect(rainGain).connect(master)
    noise.start()

    // hum da cidade: 2 saws detunados → lowpass
    const humFilter = ctx.createBiquadFilter()
    humFilter.type = 'lowpass'
    humFilter.frequency.value = 170
    humGain = ctx.createGain()
    humGain.gain.value = 0.04
    for (const freq of [50, 50.7]) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = freq
      osc.connect(humFilter)
      osc.start()
      nodes.push(osc)
    }
    humFilter.connect(humGain).connect(master)
    nodes.push(noise, rainFilter, rainGain, humFilter, humGain, master)
  }

  return {
    start() {
      ensure()
      void ctx!.resume()
    },
    stop() {
      void ctx?.suspend()
    },
    setDepth(d: number) {
      if (!ctx || !rainGain || !rainFilter || !humGain) return
      const c = Math.min(1, Math.max(0, d))
      rainGain.gain.setTargetAtTime(c * 0.16, ctx.currentTime, 0.4)
      rainFilter.frequency.setTargetAtTime(600 + c * 1200, ctx.currentTime, 0.4)
      humGain.gain.setTargetAtTime(0.03 + c * 0.05, ctx.currentTime, 0.4)
    },
    whoosh() {
      if (!ctx || !master || ctx.state !== 'running') return
      const len = Math.floor(ctx.sampleRate * 0.5)
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 320
      bp.Q.value = 0.8
      const g = ctx.createGain()
      g.gain.value = 0.5
      src.connect(bp).connect(g).connect(master)
      src.start()
    },
  }
}
