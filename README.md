# NEON DIVE — Leonardo Marzeuski

Portfólio 3D cinematográfico: uma descida contínua por uma megacidade neon-noir
na chuva — das nuvens ao subsolo — dirigida por scroll. Next.js 16 + React Three
Fiber 9, cidade 100% procedural (zero assets 3D), qualidade adaptativa por tier
de GPU, bilíngue PT/EN (default EN).

## Rodar

npm install
npm run dev          # http://localhost:3000

## Scripts

npm run test         # vitest (libs puras)
npm run e2e          # playwright (fluxos completos, WebGL via SwiftShader)
npm run typecheck    # tsc --noEmit
npm run build        # build de produção

## Query params de debug

?tier=0..3   força o tier de qualidade (0 = fallback estático)
?noboot=1    pula o boot overlay

## Arquitetura (resumo)

Canvas R3F fixo atrás de 5 seções DOM reais (scroll nativo + Lenis).
GSAP ScrollTrigger scruba um proxy t∈[0,1]; um único useFrame amostra dois
trilhos CatmullRom (posição/look-at) com damping. Spec completo em
docs/superpowers/specs/2026-07-09-neon-dive-design.md.

Easter egg: ↑↑↓↓←→←→ B A
