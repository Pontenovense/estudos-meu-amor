// Supabase Edge Function para geração de flashcards com IA
// Versão com melhor parsing de JSON

// Modelo correto conforme documentação do Google Gemini API
const DEFAULT_MODEL = 'gemini-1.5-flash';

function getModel(): string {
  return Deno.env.get('GOOGLE_GEMINI_MODEL') || DEFAULT_MODEL;
}

const GEMINI_API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function corsResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

const SYSTEM_PROMPT = `Você é um especialista em criação de flashcards educacionais.
Sua função é gerar exatamente 10 flashcards com base nos seguintes campos de entrada:
- MATERIA
- TOPICO_ESPECIFICO
- TEXTO_BASE (opcional)

Regras:
1. Gere sempre 10 flashcards.
2. Cada flashcard deve ter: pergunta, alternativas (2 ou 3), resposta_correta.
3. resposta_correta deve ser exatamente igual a uma das alternativas.
4. Retorne APENAS JSON válido, sem texto antes ou depois.

Formato:
{"flashcards":[{"pergunta":"...","alternativas":["A","B"],"resposta_correta":"A"},...]}

Gere os flashcards agora.`;

// Parser JSON mais robusto
function parseAIResponse(text: string): any {
  console.log('Texto recebido (primeiros 500 chars):', text.substring(0, 500));
  
  // Tentar encontrar JSON de várias formas
  let jsonStr = '';
  
  // Método 1: Procurar por { ... }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    jsonStr = match[0];
  } else {
    // Método 2: Procurar por [
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonStr = '{"flashcards":' + arrayMatch[0] + '}';
    }
  }
  
  if (!jsonStr) {
    console.log('Nenhum JSON encontrado no texto');
    return null;
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('Erro ao fazer parse:', e);
    // Tentar limpar o JSON
    try {
      // Remover caracteres inválidos
      const cleaned = jsonStr.replace(/[\x00-\x1F\x7F]/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e2) {
      console.log('Erro ao fazer parse após limpeza:', e2);
      return null;
    }
  }
}

Deno.serve(async (req) => {
  console.log('=== INÍCIO DA FUNÇÃO ===');
  
  if (req.method === 'OPTIONS') {
    return corsResponse({ ok: true });
  }

  try {
    const body = await req.json();
    const { materia, materia_id, topico_especifico, texto_base, user_id } = body;

    console.log('Dados:', { materia, materia_id, user_id });

    if (!materia || !materia_id || !user_id) {
      return corsResponse({ error: 'Parâmetros faltando' }, 400);
    }

    if (!topico_especifico && !texto_base) {
      return corsResponse({ error: 'Forneça topico ou texto' }, 400);
    }

    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      return corsResponse({ error: 'API key não configurada' }, 500);
    }

    const model = getModel();
    console.log('Modelo:', model);

    const prompt = SYSTEM_PROMPT
      .replace('{{MATERIA}}', materia)
      .replace('{{TOPICO_ESPECIFICO}}', topico_especifico || '')
      .replace('{{TEXTO_BASE}}', texto_base || '');

    const geminiUrl = `${GEMINI_API_URL_BASE}/${model}:generateContent?key=${apiKey}`;
    console.log('Chamando Gemini...');

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'  // Forçar resposta JSON
        },
      }),
    });

    console.log('Status Gemini:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      console.error('Erro Gemini:', err);
      return corsResponse({ error: 'Erro na API do Gemini', details: err }, 500);
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Texto recebido, tamanho:', text.length);

    if (!text) {
      return corsResponse({ error: 'Resposta vazia da IA' }, 500);
    }

    // Usar parser mais robusto
    const jsonData = parseAIResponse(text);
    
    if (!jsonData) {
      return corsResponse({ error: 'Não foi possível parsear a resposta da IA', text_preview: text.substring(0, 200) }, 500);
    }

    let flashcards = jsonData.flashcards;
    
    // Se a resposta for um array direto (sem objeto outer)
    if (!flashcards && Array.isArray(jsonData)) {
      flashcards = jsonData;
    }

    if (!flashcards || !Array.isArray(flashcards)) {
      return corsResponse({ error: 'Formato inválido - não contém flashcards', keys: Object.keys(jsonData) }, 500);
    }

    if (flashcards.length !== 10) {
      return corsResponse({ error: 'Quantidade incorreta de flashcards', quantidade: flashcards.length }, 500);
    }

    // Validar cada flashcard
    for (let i = 0; i < flashcards.length; i++) {
      const card = flashcards[i];
      if (!card.pergunta || !card.alternativas || !card.resposta_correta) {
        return corsResponse({ error: `Flashcard ${i+1} incompleto`, card }, 500);
      }
      if (!Array.isArray(card.alternativas) || card.alternativas.length < 2 || card.alternativas.length > 3) {
        return corsResponse({ error: `Flashcard ${i+1} com alternativas inválidas` }, 500);
      }
      if (!card.alternativas.includes(card.resposta_correta)) {
        return corsResponse({ error: `Flashcard ${i+1} com resposta_correta inválida` }, 500);
      }
    }

    console.log('Flashcards validados com sucesso!');

    // Salvar no banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;

    const dbCards = flashcards.map((card: any) => ({
      user_id,
      materia_id,
      pergunta: card.pergunta,
      resposta: card.resposta_correta,
      alternativas: card.alternativas,
      resposta_correta: card.resposta_correta,
      criado_por_ia: true,
      nivel_dificuldade: 'medio',
      vezes_revisado: 0,
      acertos: 0,
      erros: 0,
    }));

    console.log('Salvando no banco...');
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(dbCards),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return corsResponse({ error: 'Erro ao salvar', details: err }, 500);
    }

    const insertedData = await insertRes.json();
    console.log('Sucesso! Flashcards salvos:', insertedData.length);

    return corsResponse({ success: true, count: flashcards.length, model });

  } catch (e) {
    console.error('Erro geral:', e);
    return corsResponse({ error: String(e) }, 500);
  }
});
