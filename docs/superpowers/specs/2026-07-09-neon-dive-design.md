# NEON DIVE — Design Doc

**Data:** 2026-07-09 · **Projeto:** `portfolios/portfolio-neondive/` · **Status:** aprovado em brainstorming, aguardando revisão final do spec

Portfólio 3D cinematográfico de Leonardo Marzeuski (Engenheiro de Software Fullstack, foco em produtos IA/LLM). Substituto conceitual do `portfolio-hermes` — projeto novo do zero, herdando apenas o **conteúdo real do CV** (bilíngue PT/EN) e lições aprendidas (fallbacks, reduced-motion, self-tests, Konami).

---

## 1. Visão

Um site de página única onde o scroll é uma **descida cinematográfica contínua por uma megacidade neon-noir à noite, na chuva** — das nuvens ao subsolo, sem cortes de câmera. Estética cyberpunk executada em nível de estúdio premiado (referências: Igloo Inc SOTY 2024, Cyber City Orion), não "grid roxo genérico".

**Público:** recruiters e clientes (PT-BR e internacional).
**Critério de sucesso:** o visitante scrolla até o fim porque *quer ver o que vem a seguir* — e sai lembrando do site. Conteúdo íntegro, indexável e acessível mesmo sem WebGL.

### Decisões de brainstorming (fechadas com o usuário)

| Decisão | Escolha |
|---|---|
| Conceito | Mundo 3D cinematográfico — câmera em trilho de scroll, cena única sem cortes |
| Direção de arte | Cyberpunk neon-noir (preto + magenta + ciano elétrico; chuva; hologramas) |
| Estrutura narrativa | **Mergulho vertical**: nuvens → topos das torres → trânsito → subsolo → terminal |
| Stack | Next.js (App Router) + TypeScript + React Three Fiber + drei + postprocessing + GSAP ScrollTrigger + Lenis |
| Conteúdo | Portado do hermes (projetos, trajetória, skills, contato), i18n PT/EN, default EN |
| Mobile | 3D adaptativo em todos os aparelhos (tier de qualidade automático) |
| Deploy | Vercel |

---

## 2. A experiência (o que o visitante vive)

### Boot / preloader diegético
Loader que já é parte da narrativa: um "sinal de conexão" à cidade — estática, barra de sintonia, texto de handshake de terminal. Renderizado em shader/CSS (custo de download ~0), escondendo compilação de shaders e streaming de texturas (`useProgress`). Auto-skip rápido (≤3s quando os assets já estão em cache); clique ou `ESC` pula. Com `prefers-reduced-motion`: sem boot, conteúdo direto.

### CAMADA 1 — Acima das nuvens (HERO)
Silêncio visual: céu índigo profundo, lua fria, o topo de UMA megatorre furando um mar de nuvens volumétricas. O nome **LEONARDO MARZEUSKI** em letreiro de neon colossal no topo da torre, com título/subtítulo em HTML nítido. O primeiro scroll inicia o mergulho: a câmera atravessa a camada de nuvens e a cidade explode em neon lá embaixo — o "momento uau" de abertura.

### CAMADA 2 — Topos das torres (PROJETOS)
Cada projeto real do CV é um **outdoor holográfico gigante** em uma torre. A câmera faz um slalom entre as torres, assentando em cada projeto (snap por labels). Clicar/tocar num holograma abre um painel HUD (DOM) com detalhes: descrição, stack, links GitHub/live.

### CAMADA 3 — Nível do trânsito (TRAJETÓRIA)
Começa a chuva. Um **trem de levitação magnética** cruza a cena em loop; a timeline da carreira são as **estações** iluminadas — cada ano/empresa uma parada com letreiro de neon. O texto descritivo de cada parada é DOM sincronizado.

### CAMADA 4 — Subsolo (SKILLS)
A câmera mergulha pelo vão de uma grade no chão molhado → **datacenter neon**: corredor de racks, cada grupo de skills (frontend / backend / IA-LLM / infra) é um núcleo de energia pulsando com as tecnologias orbitando como partículas nomeadas.

### CAMADA 5 — Terminal (CONTATO)
Fim da linha: uma **cabine de transmissão retrô-futurista**. O form de contato é a tela do terminal — validação client-side, envio abre `mailto:` pré-preenchido para leomarzeuskii@gmail.com (sem backend). Links GitHub/WhatsApp/LinkedIn como teclas físicas do terminal.

### Camadas transversais
- **HUD persistente:** altímetro lateral discreto (profundidade da descida = progresso do scroll, com marcadores de seção clicáveis/âncoras), toggle PT ↔ EN, toggle de som, botão de settings (qualidade + áudio — padrão premiado do Cyber City Orion).
- **Áudio (opt-in, desligado por padrão):** hum da cidade + chuva que muda por altitude, whoosh nas transições de camada. **Web Audio procedural** (ruído filtrado + osciladores sintetizados em runtime — zero arquivos de áudio, zero download; padrão já validado no hermes).
- **Transições de camada:** glitch de interferência de sinal rápido (chromatic aberration + scanline burst) ao cruzar fronteiras — costura temática entre "distritos".
- **Easter egg:** Konami code (`↑↑↓↓←→←→BA`) — apagão total da cidade, tudo religa em modo synthwave rosa.
- **Cursor:** rastro de "smear de neon" sutil no desktop (fiel ao material do mundo); nada no touch.

---

## 3. Arquitetura técnica

### Stack e versões exatas (verificadas em 2026-07-09)

```bash
npm i next@16.2.10 react@19.2 react-dom@19.2 \
  three@0.185.1 @react-three/fiber@9.6.1 \
  @react-three/drei@10.7.7 @react-three/postprocessing@3.0.4 \
  gsap @gsap/react lenis zustand
```

Regras não-negociáveis (da pesquisa):
- **WebGL, não WebGPU** — `@react-three/postprocessing` é GLSL-only; `WebGPURenderer` ainda experimental. Reavaliar no fiber v10 estável.
- **Não usar** fiber/drei alpha; manter three/fiber/drei em lockstep (lockfile commitado).
- **Não usar drei `ScrollControls`** (briga com DOM real e ScrollTrigger) **nem Theatre.js** (preso no React 18).
- `<Canvas>`/hooks R3F só em componentes `'use client'`; `dynamic(..., { ssr: false })` dentro de wrapper client; capacidades (`navigator`, WebGL) detectadas só em `useEffect`. Layout de referência: `pmndrs/react-three-next`.
- StrictMode ligado desde o dia 1; efeitos idempotentes com cleanup.

### Layout de página

```
<div fixed inset-0 z-0>  <Canvas/>  </div>   ← mundo 3D fixo atrás
<main>                                        ← scroll nativo do documento
  <section id="hero">…</section>              (5 seções DOM reais,
  <section id="projects">…</section>           conteúdo indexável/acessível,
  <section id="journey">…</section>            altura total ≈ 500–700vh)
  <section id="skills">…</section>
  <section id="contact">…</section>
</main>
<Hud/>  <ProjectModal/>  <BootOverlay/>
```

### Rig de câmera (o coração do site)

1. Trilho da descida: `THREE.CatmullRomCurve3` amostrada com `getPointAt(t)` (arc-length; nunca `getPoint`).
2. GSAP **nunca** muta a câmera: timeline mestre com `scrollTrigger: { scrub: 1 }` anima proxies (`{ t }`, `camTarget`); labels por seção + `snap: 'labelsDirectional'` para a câmera assentar em cada shot.
3. Um único `useFrame` aplica posição + `lookAt` por frame, com `MathUtils.damp` no progresso (absorve jitter) e look-ahead `t + 0.02`. **Look-at target animado independente da posição** (é o que lê como cinematográfico). Zero `setState` em `useFrame`.
4. Lenis → GSAP: `<ReactLenis root autoRaf={false}>`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t*1000))`; `gsap.ticker.lagSmoothing(0)`. Animações declaradas com `useGSAP()`.
5. Texto DOM por seção com ScrollTriggers próprios (`scrub: 0.8` vs `1` da câmera — leve parallax entre mundo e texto).
6. `ScrollTrigger.refresh()` após assets carregarem. `prefers-reduced-motion`: Lenis off, cortes secos entre keyframes.

### Estrutura de componentes

```
src/
├── app/                      # App Router: layout, page, metadata bilíngue
├── components/
│   ├── world/                # tudo 'use client', atrás de dynamic ssr:false
│   │   ├── World.tsx         # Canvas + tier gate + Suspense
│   │   ├── CameraRig.tsx     # curva + proxies GSAP + useFrame único
│   │   ├── Effects.tsx       # bloom, CA, vignette, grain, DOF (por tier)
│   │   ├── WorldEnv.tsx      # fog, cor de fundo, luzes mínimas
│   │   └── layers/
│   │       ├── CloudLayer.tsx      # hero: nuvens, lua, megatorre, letreiro
│   │       ├── TowersLayer.tsx     # projetos: torres + hologramas
│   │       ├── TransitLayer.tsx    # trajetória: trem, estações, chuva
│   │       ├── UndergroundLayer.tsx# skills: datacenter, núcleos
│   │       └── TerminalLayer.tsx   # contato: cabine
│   ├── dom/                  # seções HTML, Hud, ProjectModal, BootOverlay, ContactForm
│   └── materials/            # HologramMaterial, NeonTextMaterial, shaders GLSL
├── lib/
│   ├── store.ts              # zustand: lang, tier, activeSection, som, modal
│   ├── i18n.ts               # dicionário PT/EN + t(key) (portado do hermes)
│   ├── content.ts            # projetos, trajetória, skills (dados reais do CV)
│   └── curve.ts              # pontos do trilho + targets por seção
```

Cada layer monta/desmonta por proximidade da câmera (altitude culling via faixa de `t`) — a GPU nunca segura o mundo inteiro.

---

## 4. Receita por efeito (a "receita do uau")

Princípio (padrão dos premiados): **fake tudo que é estático**; frame budget vai para 1 buffer de reflexo + 1 cadeia de bloom + partículas GPU-residentes. Ordem do post: render → bloom → grain/vignette/chromatic aberration.

| Efeito | Técnica | Custo |
|---|---|---|
| **Chuva** | `THREE.Points`, textura de streak pré-borrada 512², volume cilíndrico centrado na câmera, reciclagem `mod()` no vertex shader; intensidade cresce com a profundidade | 1 draw call, ~zero |
| **Neon + bloom** | Um único `<Bloom mipmapBlur luminanceThreshold={1}>`; materiais HDR-emissivos (`color=[4,1,8]`, `toneMapped={false}`) — sem SelectiveBloom; `resolutionScale` 0.5 | 1 cadeia mip |
| **Texto neon** | drei `<Text>` (troika SDF, worker, nítido em qualquer zoom) emissivo + flicker; fonte woff subsetada ~50 KB | trivial |
| **Hologramas** | ShaderMaterial: fresnel + scanlines por posição + glitch em bandas no vertex; `AdditiveBlending`, `depthWrite:false`, `renderOrder` explícito | só ALU |
| **Asfalto molhado** | drei `MeshReflectorMaterial` no chão: `depthScale` (fade = molhado, não espelho) + `distortion` com normal map; buffer 256/512/1024 por tier | 1 render extra |
| **Nuvens** | billboards com shader de densidade + fade por ângulo (não raymarch em tier ≤ médio) | barato |
| **Feixes volumétricos** | cones abertos com gradiente radial/longitudinal aditivo + bloom por cima (fake premiado); raymarch screen-space só em tier alto | 1 draw/feixe |
| **Fog** | `THREE.Fog` na cor base noir — dobra como culling do horizonte procedural | grátis |
| **Glitch de transição** | burst rápido de chromatic aberration + scanlines ao cruzar camadas | pontual |

---

## 5. Cidade procedural (zero artista 3D, < 5 MB total)

- **Prédios:** 1 `InstancedMesh` de BoxGeometry unitário, 2–5k instâncias (escala/posição via matriz, tint via `setColorAt`) = 1 draw call. Variação procedural de silhueta para nunca repetir no scroll.
- **Janelas:** textura de fachada gerada em runtime (Canvas API: grid de retângulos acesos amarelo/ciano) como `map` + `emissiveMap`; 3–5 variantes + offset de UV por instância.
- **Shading:** `MeshMatcapMaterial` (matcap escuro azul/roxo CC0 do acervo nidorx/matcaps, 128–256px) — **zero luzes de cena**; iluminação percebida = emissivo + bloom + matcap.
- **Hero props** (trem, cabine, mobiliário): Kenney City Kit / Quaternius (CC0, GLTF), < 1.5 MB somados.
- **Pipeline de assets:** `gltf-transform optimize --compress meshopt --texture-compress ktx2 --texture-resize 1024`. **Meshopt sobre Draco** (decoder 30 KB vs 300 KB). KTX2: UASTC normais, ETC1S albedo. Variantes por tier com `<Suspense>` aninhado.
- **Céu:** sem HDRI — fog color + gradiente em shader.

**Orçamento:** procedural ≈ 0 KB · props ≈ 0.5–1.5 MB · matcap ≈ 10 KB · fontes ≈ 50 KB · JS ≈ 1–1.5 MB gzip → **< 5 MB**.

---

## 6. Performance adaptativa e fallbacks

Duas fases:
1. **Boot:** `useDetectGPU` (hint, não verdade — benchmark congelado dez/2025) + `deviceMemory` → perfil inicial `{ dpr, postprocessing, textureRes, reflexo, partículas }`.
2. **Runtime:** `<PerformanceMonitor factor={1} flipflops={3} onFallback>` ajustando DPR em **passos de 0.5** (0.5–2, nunca contínuo); filhos togglam efeitos via `usePerformanceMonitor`. `<AdaptiveDpr pixelated />` + `<AdaptiveEvents />` no scroll intenso.

| Tier | O que liga |
|---|---|
| **high** (desktop dedicada) | tudo: chuva densa, reflexo 1024, bloom + CA + vignette + grain + DOF nos snaps, volumetria raymarched |
| **medium** (notebook/celular bom) | chuva reduzida, reflexo 512, só bloom + vignette, sem DOF |
| **low** (celular fraco) | cena essencial, reflexo 256 com `blur:[0,0]`, bloom meia-res, 60fps acima de tudo |
| **tier 0 / sem WebGL** | fallback 2D estilizado (gradientes CSS + conteúdo DOM íntegro bilíngue) |

Mobile: DPR cap 1.5–2; mirar 40–60 fps sustentado (throttling térmico), texturas ≤1024, KTX2 (iOS Safari ~300 MB de teto).

**Acessibilidade:**
- `prefers-reduced-motion`: sem descida automática — cenas estáticas por seção, navegação por âncoras, cortes secos.
- Conteúdo 100% em DOM real (scroll nativo): screen readers, SEO, âncoras e Ctrl+F funcionam.
- Canvas pausa fora de foco/aba (`visibilitychange`); mundo 3D em `next/dynamic` — o HTML chega primeiro.
- Form e modal navegáveis por teclado; foco gerenciado.

---

## 7. Conteúdo e i18n

- Dados reais portados do `portfolio-hermes/index.html` (dicionário `I18N`): projetos, trajetória, skills, contatos (GitHub/WhatsApp/e-mail), textos PT/EN.
- i18n próprio e leve (`lib/i18n.ts` + `t(key)`), **default EN**, toggle no HUD, persistido em `localStorage`, sem reload.
- `<title>`/`<meta description>` bilíngues; Open Graph com imagem do mundo neon.

## 8. Testes, verificação e deploy

- **Estático:** TypeScript strict + ESLint.
- **Playwright smoke:** página carrega; canvas monta (ou fallback aparece); scroll percorre as 5 seções; modal de projeto abre/fecha; form valida e monta `mailto:`; toggle PT/EN troca textos; âncoras do HUD navegam.
- **Verificação visual:** browser (Claude in Chrome) — screenshots por seção, checagem de console/erros de shader, FPS.
- **Deploy:** Vercel — preview URL a cada iteração, produção ao final.

## 9. Riscos e mitigação (da pesquisa)

| Risco | Mitigação |
|---|---|
| Incompatibilidade React 19.2/fiber (reconciler) | Pinar fiber 9.6.1 + drei 10.x + post 3.x em lockstep, lockfile commitado |
| Hydration mismatch / three no bundle server | `ssr:false` via wrapper client; capacidades só em `useEffect` |
| Jitter no rig de câmera | `lagSmoothing(0)`, damp do progresso, 1 write de câmera/frame, zero setState em useFrame |
| Conflito de sistemas de scroll | Um único dono (Lenis+ScrollTrigger); drei ScrollControls banido |
| Throttling térmico mobile | PerformanceMonitor mirando 40–60 fps sustentado; DPR cap |
| Crash de memória iOS Safari | KTX2, texturas ≤1024 mobile, variantes por tier |
| Sorting de transparência (aditivos) | `depthWrite:false` + `renderOrder` explícito, poucos aditivos sobrepostos |
| Loading longo | Preloader diegético shader/CSS + compilação em estágios + `useProgress` |
| Estética "cyberpunk genérico" | Disciplina de paleta (1 base profunda + 2 acentos), luz de cinema, transições polidas > espetáculo (lição Montfort/Awwwards) |

## 10. Fora de escopo (v1)

- WebGPU/TSL (aguardar fiber v10 estável).
- Backend de contato (mantém `mailto:`).
- Gamificação/colecionáveis (ideia anotada para v2).
- CMS — conteúdo em `lib/content.ts` versionado.

## 11. Referências

- Pesquisa completa (7 agentes, 2026-07-09): rig de câmera — Codrops nov/2025, gist Anderson Mancini; chuva — medium.com/antaeus-ar; hologramas — threejs-journey + ektogamat/threejs-holographic-material; reflexos — drei MeshReflectorMaterial docs; volumetria fake — Codrops 2022; cidade procedural — dev.to block-city-racer; assets — Kenney, Quaternius/Poly Pizza, nidorx/matcaps; premiados — Igloo Inc (SOTY 2024), Cyber City Orion, Sébastien Lempens, Montfort, Samsy Gen-02.
