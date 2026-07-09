import type { Localized } from './i18n'

export const NEON_FONT = '/fonts/orbitron-700.woff'

export interface Project {
  id: string
  codename: string
  title: string
  type: Localized
  status: Localized
  statusColor: string
  desc: Localized
  challenges: Localized
  stack: string[]
  demo: string | null
  code: string
}

export interface TimelineStop {
  year: Localized
  role: Localized
  company: string
  desc: Localized
  tags: string[]
}

export interface SkillGroup {
  code: string
  cat: Localized
  items: string[]
}

export interface Social {
  label: string
  handle: string
  href: string
}

export const PROJECTS: Project[] = [
  {
    id: 'glassgpt', codename: 'AI-01', title: 'GlassGPT',
    type: { en: 'AI · From scratch', pt: 'IA · Do zero' },
    status: { en: 'Live', pt: 'No ar' }, statusColor: '#34d399',
    desc: {
      en: 'An autograd (automatic differentiation) engine written from scratch in TypeScript — no ML libraries — with an interactive computation-graph explorer showing backprop flow node by node, live in the browser.',
      pt: 'Um motor de autograd (diferenciação automática) escrito do zero em TypeScript — sem libs de ML — com explorador interativo do grafo de computação mostrando o backprop nó a nó, ao vivo no navegador.',
    },
    challenges: {
      en: 'Implementing reverse-mode autodiff (chain rule + topological ordering) and proving correctness with gradient checking against finite-difference estimates.',
      pt: 'Implementar autodiff em modo reverso (regra da cadeia + ordenação topológica) e provar corretude via gradient checking contra estimativas por diferenças finitas.',
    },
    stack: ['TypeScript', 'React', 'Vite'],
    demo: 'https://glassgpt.vercel.app', code: 'https://github.com/leomarzeuski/glassgpt',
  },
  {
    id: 'semfundo', codename: 'AI-02', title: 'SemFundo',
    type: { en: 'Browser AI', pt: 'IA no navegador' },
    status: { en: 'Live', pt: 'No ar' }, statusColor: '#34d399',
    desc: {
      en: 'A background remover that runs 100% in the browser — the AI (ONNX Runtime Web + @imgly/background-removal) processes on-device, nothing leaves your machine. Refine brush with undo/redo, PT/EN.',
      pt: 'Removedor de fundo que roda 100% no navegador — a IA (ONNX Runtime Web + @imgly/background-removal) processa on-device, nada sai do seu aparelho. Pincel de refino com undo/redo, PT/EN.',
    },
    challenges: {
      en: 'Running a ~40MB segmentation model on-device with real progress and a manual refine brush, keeping privacy verifiable.',
      pt: 'Rodar um modelo de segmentação de ~40MB on-device com progresso real e pincel de refino manual, mantendo a privacidade verificável.',
    },
    stack: ['React 19', 'TypeScript', 'Tailwind 4', 'ONNX'],
    demo: 'https://semfundo.app', code: 'https://github.com/leomarzeuski/bg-remover',
  },
  {
    id: 'truemeter', codename: 'AI-03', title: 'TrueMeter',
    type: { en: 'AI Backend', pt: 'Backend com IA' },
    status: { en: 'In progress', pt: 'Em desenvolvimento' }, statusColor: '#fbbf24',
    desc: {
      en: 'An API that extracts and structures data from utility bills (including PDFs): deterministic extraction first, with an LLM (OpenAI) fallback; async jobs on Celery/Redis.',
      pt: 'API que extrai e estrutura dados de contas de serviço (inclusive PDFs): extração determinística primeiro, com fallback para LLM (OpenAI); jobs assíncronos em Celery/Redis.',
    },
    challenges: {
      en: 'A hybrid deterministic→LLM pipeline with async processing, migrations and a clean upload/read contract.',
      pt: 'Pipeline híbrido determinístico→LLM com processamento assíncrono, migrações e um contrato limpo de upload/leitura.',
    },
    stack: ['FastAPI', 'Python', 'PostgreSQL', 'Celery', 'Redis', 'OpenAI'],
    demo: null, code: 'https://github.com/leomarzeuski/truemeter-ai-bill-analyzer',
  },
  {
    id: 'symbion', codename: 'SYS-04', title: 'Symbion',
    type: { en: 'Dev tool · Go', pt: 'Dev tool · Go' },
    status: { en: 'Active', pt: 'Ativo' }, statusColor: '#5f6dff',
    desc: {
      en: 'A Go CLI that keeps .env, .env.example, .symbion.yaml and Docker Compose in sync — validates vars by type/enum/regex, shares encrypted profiles with the team, and gates CI without a .env.',
      pt: 'CLI em Go que mantém .env, .env.example, .symbion.yaml e Docker Compose em sincronia — valida vars por tipo/enum/regex, compartilha perfis criptografados com o time e faz gate de CI sem .env.',
    },
    challenges: {
      en: 'A documented environment contract with encrypted profiles (macOS Keychain) and drift detection for CI.',
      pt: 'Um contrato de ambiente documentado com perfis criptografados (Keychain do macOS) e detecção de drift para CI.',
    },
    stack: ['Go'], demo: null, code: 'https://github.com/leomarzeuski/Symbion',
  },
  {
    id: 'vuecommerce', codename: 'WEB-05', title: 'VueCommerce',
    type: { en: 'E-commerce · Vue', pt: 'E-commerce · Vue' },
    status: { en: 'Done', pt: 'Concluído' }, statusColor: '#34d399',
    desc: {
      en: 'A full e-commerce built with Vue 3 + TypeScript + Tailwind + shadcn/ui: category filters and real-time search, persistent favorites, product detail, checkout (Card/PIX/Boleto) and profile.',
      pt: 'E-commerce completo em Vue 3 + TypeScript + Tailwind + shadcn/ui: filtros por categoria e busca em tempo real, favoritos persistentes, detalhe de produto, checkout (Cartão/PIX/Boleto) e perfil.',
    },
    challenges: {
      en: 'State architecture and a complete checkout UX with multiple payment methods and persistence.',
      pt: 'Arquitetura de estado e uma UX de checkout completa com múltiplos pagamentos e persistência.',
    },
    stack: ['Vue 3', 'TypeScript', 'Tailwind', 'shadcn/ui'],
    demo: null, code: 'https://github.com/leomarzeuski/VueCommerce',
  },
  {
    id: 'smartpreco', codename: 'MOB-06', title: 'SmartPreço',
    type: { en: 'Fullstack monorepo', pt: 'Monorepo fullstack' },
    status: { en: 'Active', pt: 'Ativo' }, statusColor: '#5f6dff',
    desc: {
      en: 'A collaborative supermarket price-comparison platform in a monorepo: mobile app (RN/Expo), web landing, admin dashboard (Next.js) and API (NestJS + PostgreSQL). Collaborative entry with photos, history and notifications.',
      pt: 'Plataforma colaborativa de comparação de preços em mercados, em monorepo: app mobile (RN/Expo), landing web, dashboard admin (Next.js) e API (NestJS + PostgreSQL). Cadastro colaborativo com fotos, histórico e notificações.',
    },
    challenges: {
      en: 'A multi-platform monorepo and collaborative moderation across mobile, web, admin and API.',
      pt: 'Um monorepo multi-plataforma e moderação colaborativa entre mobile, web, admin e API.',
    },
    stack: ['React Native', 'Expo', 'Next.js', 'NestJS', 'PostgreSQL'],
    demo: null, code: 'https://github.com/leomarzeuski/SmartPreco',
  },
]

export const TIMELINE: TimelineStop[] = [
  {
    year: { en: '2025 — NOW', pt: '2025 — AGORA' },
    role: { en: 'Software Developer', pt: 'Desenvolvedor de Software' },
    company: 'Meta',
    desc: {
      en: 'Fullstack of AI-powered products: shipped a production LLM conversational agent on AWS Bedrock (prompt design, tool/function calling); React/Next.js (App Router) platform with real-time dashboards, RBAC and live data (Socket.io/Redis); Node.js/Drizzle/PostgreSQL backend with payments and async webhooks; Vitest/Playwright, OpenAPI.',
      pt: 'Fullstack de produtos com IA: agente LLM conversacional em produção no AWS Bedrock (prompt design, tool/function calling); plataforma React/Next.js (App Router) com dashboards em tempo real, RBAC e dados ao vivo (Socket.io/Redis); backend Node.js/Drizzle/PostgreSQL com pagamentos e webhooks assíncronos; Vitest/Playwright, OpenAPI.',
    },
    tags: ['AWS Bedrock', 'Next.js', 'LLM', 'PostgreSQL'],
  },
  {
    year: { en: '2023 — 2025', pt: '2023 — 2025' },
    role: { en: 'Software Developer (Jr → Mid)', pt: 'Desenvolvedor de Software (Jr → Pleno)' },
    company: 'bUP Hotels',
    desc: {
      en: 'Dashboard architecture evolution: Server Components for performance and SEO, PostgreSQL query optimization at high scale, observability with Datadog, state architecture with Zustand; REST APIs with Node/Express and tests.',
      pt: 'Evolução da arquitetura do dashboard: Server Components para performance e SEO, otimização de queries PostgreSQL em alta escala, observabilidade com Datadog, arquitetura de estado com Zustand; APIs REST com Node/Express e testes.',
    },
    tags: ['Next.js', 'PostgreSQL', 'Datadog', 'Zustand'],
  },
  {
    year: { en: '2023', pt: '2023' },
    role: { en: 'Mid Software Developer', pt: 'Desenvolvedor Pleno' },
    company: 'Pure Codex (Poland · remote)',
    desc: {
      en: 'Cross-platform app (React Native + RN Web) for a Polish company partnered with Uber; Zustand state, feature flags for controlled releases, design system and accessibility; daily English with an international team.',
      pt: 'App cross-platform (React Native + RN Web) para empresa polonesa parceira da Uber; estado com Zustand, feature flags para releases controlados, design system e acessibilidade; inglês diário com time internacional.',
    },
    tags: ['React Native', 'Zustand', 'Feature Flags'],
  },
  {
    year: { en: '2023', pt: '2023' },
    role: { en: 'Software Developer (Intern → Jr)', pt: 'Desenvolvedor (Estágio → Jr)' },
    company: 'TV TEM (Rede Globo affiliate)',
    desc: {
      en: 'Web apps and institutional sites; React/TS/HTML5/CSS3, WordPress, high-conversion landing pages, REST/GraphQL, Jest.',
      pt: 'Aplicações web e sites institucionais; React/TS/HTML5/CSS3, WordPress, landing pages de alta conversão, REST/GraphQL, Jest.',
    },
    tags: ['React', 'GraphQL', 'WordPress'],
  },
  {
    year: { en: '2022', pt: '2022' },
    role: { en: 'Software Engineer Intern', pt: 'Estágio em Eng. de Software' },
    company: 'Dynamich',
    desc: {
      en: 'Responsive interfaces and REST/GraphQL API integration; React/JS/TS, Git/GitHub Flow, Scrum/Kanban.',
      pt: 'Interfaces responsivas e integração de APIs REST/GraphQL; React/JS/TS, Git/GitHub Flow, Scrum/Kanban.',
    },
    tags: ['React', 'TypeScript', 'GraphQL'],
  },
  {
    year: { en: '2020 — 2025', pt: '2020 — 2025' },
    role: { en: 'B.Sc. Computer Engineering', pt: 'Bacharelado em Eng. da Computação' },
    company: 'Centro Universitário Facens',
    desc: {
      en: 'Computer Engineering degree — foundations in algorithms, systems and software engineering.',
      pt: 'Graduação em Engenharia da Computação — fundamentos em algoritmos, sistemas e engenharia de software.',
    },
    tags: ['Education'],
  },
]

export const SKILLS: SkillGroup[] = [
  { code: 'AI', cat: { en: 'AI / LLM', pt: 'IA / LLM' }, items: ['LLM Agents', 'Prompt Design', 'Tool / Function Calling', 'AWS Bedrock', 'OpenAI API'] },
  { code: 'FE', cat: { en: 'Front-end', pt: 'Front-end' }, items: ['React', 'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Material UI', 'Vue 3'] },
  { code: 'MB', cat: { en: 'Mobile', pt: 'Mobile' }, items: ['React Native', 'Expo', 'React Native Web'] },
  { code: 'BE', cat: { en: 'Back-end', pt: 'Back-end' }, items: ['Node.js', 'Express', 'NestJS', 'FastAPI / Python', 'Drizzle ORM', 'PostgreSQL', 'Redis', 'Socket.io', 'REST / GraphQL'] },
  { code: 'CQ', cat: { en: 'Cloud & Quality', pt: 'Cloud & Qualidade' }, items: ['AWS', 'Docker', 'Datadog', 'Vercel', 'Git', 'Vitest', 'Playwright', 'Jest', 'OpenAPI'] },
]

export const SOCIALS: Social[] = [
  { label: 'GitHub', handle: '@leomarzeuski', href: 'https://github.com/leomarzeuski' },
  { label: 'LinkedIn', handle: 'Leonardo Marzeuski', href: 'https://www.linkedin.com/in/leonardo-marzeuski' },
  { label: 'WhatsApp', handle: '+55 15 98810-8850', href: 'https://wa.me/5515988108850' },
  { label: 'E-mail', handle: 'leomarzeuskii@gmail.com', href: 'mailto:leomarzeuskii@gmail.com' },
]
