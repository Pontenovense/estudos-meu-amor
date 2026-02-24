-- ====================================
-- StudyFlow - Schema SQL para Supabase
-- ====================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New query > Cole e execute

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- TABELAS
-- ====================================

-- 1. Matérias
CREATE TABLE IF NOT EXISTS materias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  cor_personalizada TEXT DEFAULT '#8b5cf6',
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Planejamentos (blocos de estudo)
CREATE TABLE IF NOT EXISTS planejamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  materia_id UUID REFERENCES materias(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  duracao INTEGER NOT NULL DEFAULT 60,
  concluido BOOLEAN DEFAULT FALSE
);

-- 3. Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  materia_id UUID REFERENCES materias(id) ON DELETE CASCADE NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  criado_por_ia BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  nivel_dificuldade TEXT DEFAULT 'medio',
  vezes_revisado INTEGER DEFAULT 0,
  acertos INTEGER DEFAULT 0,
  erros INTEGER DEFAULT 0
);

-- 4. Anotações
CREATE TABLE IF NOT EXISTS anotacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  materia_id UUID REFERENCES materias(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT DEFAULT '',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sessões Pomodoro
CREATE TABLE IF NOT EXISTS sessoes_pomodoro (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  materia_id UUID REFERENCES materias(id) ON DELETE SET NULL,
  duracao INTEGER NOT NULL,
  data TIMESTAMPTZ DEFAULT NOW(),
  tipo TEXT DEFAULT 'foco'
);

-- 6. Progresso Diário
CREATE TABLE IF NOT EXISTS progresso_diario (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  minutos_estudados INTEGER DEFAULT 0,
  flashcards_revisados INTEGER DEFAULT 0,
  flashcards_acertos INTEGER DEFAULT 0,
  sessoes_pomodoro INTEGER DEFAULT 0,
  UNIQUE(user_id, data)
);

-- 7. Frases Motivacionais
CREATE TABLE IF NOT EXISTS frases_motivacionais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor TEXT DEFAULT 'Desconhecido',
  personalizada BOOLEAN DEFAULT FALSE
);

-- ====================================
-- ÍNDICES
-- ====================================

CREATE INDEX IF NOT EXISTS idx_materias_user ON materias(user_id);
CREATE INDEX IF NOT EXISTS idx_planejamentos_user ON planejamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_planejamentos_data ON planejamentos(user_id, data);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_materia ON flashcards(user_id, materia_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_user ON anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_user ON sessoes_pomodoro(user_id);
CREATE INDEX IF NOT EXISTS idx_progresso_user ON progresso_diario(user_id);
CREATE INDEX IF NOT EXISTS idx_progresso_data ON progresso_diario(user_id, data);
CREATE INDEX IF NOT EXISTS idx_frases_user ON frases_motivacionais(user_id);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE planejamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_pomodoro ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE frases_motivacionais ENABLE ROW LEVEL SECURITY;

-- Políticas para materias
CREATE POLICY "Users can view own materias" ON materias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materias" ON materias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materias" ON materias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materias" ON materias FOR DELETE USING (auth.uid() = user_id);

-- Políticas para planejamentos
CREATE POLICY "Users can view own planejamentos" ON planejamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own planejamentos" ON planejamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own planejamentos" ON planejamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own planejamentos" ON planejamentos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para flashcards
CREATE POLICY "Users can view own flashcards" ON flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON flashcards FOR DELETE USING (auth.uid() = user_id);

-- Políticas para anotacoes
CREATE POLICY "Users can view own anotacoes" ON anotacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own anotacoes" ON anotacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own anotacoes" ON anotacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own anotacoes" ON anotacoes FOR DELETE USING (auth.uid() = user_id);

-- Políticas para sessoes_pomodoro
CREATE POLICY "Users can view own sessoes" ON sessoes_pomodoro FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessoes" ON sessoes_pomodoro FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para progresso_diario
CREATE POLICY "Users can view own progresso" ON progresso_diario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progresso" ON progresso_diario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progresso" ON progresso_diario FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para frases_motivacionais (usuários veem as próprias + as globais)
CREATE POLICY "Users can view frases" ON frases_motivacionais FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own frases" ON frases_motivacionais FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own frases" ON frases_motivacionais FOR DELETE
  USING (auth.uid() = user_id AND personalizada = true);

-- ====================================
-- FRASES MOTIVACIONAIS PADRÃO
-- ====================================

INSERT INTO frases_motivacionais (user_id, texto, autor, personalizada) VALUES
  (NULL, 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', 'Robert Collier', false),
  (NULL, 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', 'Nelson Mandela', false),
  (NULL, 'Não importa quão devagar você vá, desde que não pare.', 'Confúcio', false),
  (NULL, 'O conhecimento é o único recurso que cresce quando compartilhado.', 'Desconhecido', false),
  (NULL, 'Cada dia é uma nova oportunidade para aprender algo incrível.', 'StudyFlow', false),
  (NULL, 'A persistência é o caminho do êxito.', 'Charles Chaplin', false),
  (NULL, 'Você não precisa ser perfeito, precisa ser persistente.', 'StudyFlow', false),
  (NULL, 'Estudar é investir em si mesmo. Não há melhor investimento.', 'Benjamin Franklin', false),
  (NULL, 'A disciplina é a ponte entre seus objetivos e suas conquistas.', 'Jim Rohn', false),
  (NULL, 'Acredite em você. Cada hora de estudo te aproxima dos seus sonhos.', 'StudyFlow', false),
  (NULL, 'O futuro pertence àqueles que se preparam para ele hoje.', 'Malcolm X', false),
  (NULL, 'Grandes conquistas começam com pequenos passos diários.', 'StudyFlow', false),
  (NULL, 'A mente que se abre a uma nova ideia jamais volta ao seu tamanho original.', 'Albert Einstein', false),
  (NULL, 'Sua dedicação de hoje é o seu sucesso de amanhã.', 'StudyFlow', false),
  (NULL, 'Nunca é tarde demais para ser aquilo que sempre desejou ser.', 'George Eliot', false);

-- ====================================
-- FIM DO SCRIPT
-- ====================================
