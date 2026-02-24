export interface Database {
  public: {
    Tables: {
      materias: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          descricao: string;
          cor_personalizada: string;
          data_criacao: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          descricao?: string;
          cor_personalizada?: string;
          data_criacao?: string;
        };
        Update: {
          nome?: string;
          descricao?: string;
          cor_personalizada?: string;
        };
      };
      planejamentos: {
        Row: {
          id: string;
          user_id: string;
          materia_id: string;
          titulo: string;
          data: string;
          duracao: number;
          concluido: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          materia_id: string;
          titulo: string;
          data: string;
          duracao: number;
          concluido?: boolean;
        };
        Update: {
          materia_id?: string;
          titulo?: string;
          data?: string;
          duracao?: number;
          concluido?: boolean;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          materia_id: string;
          pergunta: string;
          resposta: string;
          criado_por_ia: boolean;
          data_criacao: string;
          nivel_dificuldade: string;
          vezes_revisado: number;
          acertos: number;
          erros: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          materia_id: string;
          pergunta: string;
          resposta: string;
          criado_por_ia?: boolean;
          data_criacao?: string;
          nivel_dificuldade?: string;
          vezes_revisado?: number;
          acertos?: number;
          erros?: number;
        };
        Update: {
          pergunta?: string;
          resposta?: string;
          nivel_dificuldade?: string;
          vezes_revisado?: number;
          acertos?: number;
          erros?: number;
        };
      };
      anotacoes: {
        Row: {
          id: string;
          user_id: string;
          materia_id: string;
          titulo: string;
          conteudo: string;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          materia_id: string;
          titulo: string;
          conteudo?: string;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          materia_id?: string;
          titulo?: string;
          conteudo?: string;
          data_atualizacao?: string;
        };
      };
      sessoes_pomodoro: {
        Row: {
          id: string;
          user_id: string;
          materia_id: string | null;
          duracao: number;
          data: string;
          tipo: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          materia_id?: string | null;
          duracao: number;
          data?: string;
          tipo: string;
        };
        Update: {
          duracao?: number;
          tipo?: string;
        };
      };
      progresso_diario: {
        Row: {
          id: string;
          user_id: string;
          data: string;
          minutos_estudados: number;
          flashcards_revisados: number;
          flashcards_acertos: number;
          sessoes_pomodoro: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          data: string;
          minutos_estudados?: number;
          flashcards_revisados?: number;
          flashcards_acertos?: number;
          sessoes_pomodoro?: number;
        };
        Update: {
          minutos_estudados?: number;
          flashcards_revisados?: number;
          flashcards_acertos?: number;
          sessoes_pomodoro?: number;
        };
      };
      frases_motivacionais: {
        Row: {
          id: string;
          user_id: string | null;
          texto: string;
          autor: string;
          personalizada: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          texto: string;
          autor?: string;
          personalizada?: boolean;
        };
        Update: {
          texto?: string;
          autor?: string;
        };
      };
    };
  };
}

// Convenient type aliases
export type Materia = Database['public']['Tables']['materias']['Row'];
export type Planejamento = Database['public']['Tables']['planejamentos']['Row'];
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type Anotacao = Database['public']['Tables']['anotacoes']['Row'];
export type SessaoPomodoro = Database['public']['Tables']['sessoes_pomodoro']['Row'];
export type ProgressoDiario = Database['public']['Tables']['progresso_diario']['Row'];
export type FraseMotivacional = Database['public']['Tables']['frases_motivacionais']['Row'];

export type Page =
  | 'dashboard'
  | 'materias'
  | 'planejamento'
  | 'pomodoro'
  | 'flashcards'
  | 'anotacoes'
  | 'progresso'
  | 'motivacional';
