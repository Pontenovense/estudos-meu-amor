# 📚 StudyFlow – Plataforma de Estudos

Aplicação completa de organização e produtividade para estudantes, com interface em **Português Brasileiro (pt-BR)**.

## ✨ Funcionalidades

- 🔐 **Autenticação** – Cadastro, login, recuperação de senha (Supabase Auth)
- 🏠 **Dashboard** – Visão geral com estatísticas e atalhos rápidos
- 📚 **Matérias** – CRUD completo com cores personalizadas
- 📅 **Planejamento Semanal** – Blocos de estudo por dia
- ⏳ **Pomodoro Timer** – Timer configurável com animação circular
- 🧠 **Flashcards** – Criação manual + geração com Google Gemini AI
- 📝 **Anotações** – Editor rico por matéria
- 📊 **Progresso** – Gráficos, conquistas e streak
- 💌 **Motivação** – Frases motivacionais diárias

## 🧱 Stack

- **React 19** + TypeScript
- **Vite** (build)
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL + RLS)
- **Google Gemini API** (geração de flashcards)
- **Lucide React** (ícones)

## 🚀 Setup Rápido

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd studyflow
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** → **New query**
3. Cole o conteúdo do arquivo `supabase-schema.sql` e execute
4. Vá em **Settings** → **API** e copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public key**

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_GEMINI_API_KEY=sua-chave-gemini-aqui
```

> **VITE_GEMINI_API_KEY** é opcional. Só necessária para gerar flashcards com IA.
> Obtenha em: [aistudio.google.com](https://aistudio.google.com)

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

### 5. Build para produção

```bash
npm run build
```

## 🗄️ Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `materias` | Disciplinas do usuário |
| `planejamentos` | Blocos de estudo semanais |
| `flashcards` | Cartões de memorização |
| `anotacoes` | Notas por matéria |
| `sessoes_pomodoro` | Sessões do timer |
| `progresso_diario` | Estatísticas diárias |
| `frases_motivacionais` | Frases de motivação |

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado. Cada usuário só acessa seus próprios dados. As frases motivacionais padrão (`user_id = NULL`) são visíveis para todos.

## 🔑 Configuração do Supabase Auth

No dashboard do Supabase:

1. **Authentication** → **Settings** → **Email Auth** → Habilitar
2. (Opcional) Desabilitar "Confirm email" para testes locais
3. (Opcional) Configurar provedores OAuth (Google, GitHub, etc.)

## 🌐 Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) → Import project
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (opcional)
4. Deploy!

## 📱 PWA

Para ativar PWA, adicione um `manifest.json` e um service worker. O app já é mobile-first e funciona perfeitamente em dispositivos móveis.

## 📂 Estrutura do Projeto

```
src/
├── App.tsx                    # Componente principal com navegação
├── main.tsx                   # Entry point
├── index.css                  # Estilos globais + Tailwind
├── lib/
│   └── supabase.ts           # Cliente Supabase
├── types/
│   └── database.ts           # Tipos TypeScript
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
├── hooks/
│   ├── useMaterias.ts        # Hook CRUD matérias
│   ├── usePlanejamentos.ts   # Hook CRUD planejamentos
│   ├── useFlashcards.ts      # Hook CRUD flashcards
│   ├── useAnotacoes.ts       # Hook CRUD anotações
│   ├── usePomodoro.ts        # Hook sessões pomodoro
│   ├── useProgresso.ts       # Hook progresso diário
│   └── useMotivacional.ts    # Hook frases motivacionais
├── components/
│   ├── Sidebar.tsx           # Menu lateral desktop
│   └── MobileNav.tsx         # Navegação mobile
└── pages/
    ├── AuthPage.tsx          # Login/Cadastro/Recuperação
    ├── Dashboard.tsx         # Painel principal
    ├── MateriasPage.tsx      # Gerenciar matérias
    ├── PlanejamentoPage.tsx  # Planejamento semanal
    ├── PomodoroPage.tsx      # Timer Pomodoro
    ├── FlashcardsPage.tsx    # Flashcards (manual + IA)
    ├── AnotacoesPage.tsx     # Anotações
    ├── ProgressoPage.tsx     # Progresso e conquistas
    └── MotivacionalPage.tsx  # Frases motivacionais
```

## 💜 Feito com carinho para estudantes dedicados
