// Supabase Edge Function para geração de flashcards com IA
// Versão com logs detalhados

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
{"flashcards":[{"pergunta":"...","alternativas":["A","B"],"resposta_correta":"A"},...]}`

// Parser JSON mais robusto
function parseAIResponse(text: string): any {
  console.log('--- RESPOSTA DA IA ---');
  console.log('Texto recebido (completo):', text);
  console.log('----------------------');
  
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
    try {
      const cleaned = jsonStr.replace(/[\x00-\x1F\x7F]/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e2) {
      console.log('Erro ao fazer parse após limpeza:', e2);
      return null;
    }
  }
}

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('NOVA REQUISIÇÃO - GERAÇÃO DE FLASHCARDS');
  console.log('===========================================');
  
  if (req.method === 'OPTIONS') {
    return corsResponse({ ok: true });
  }

  try {
    const body = await req.json();
    const { materia, materia_id, topico_especifico, texto_base, user_id } = body;

    // Log dos dados recebidos do frontend
    console.log('--- DADOS RECEBIDOS DO FRONTEND ---');
    console.log('MATERIA:', materia);
    console.log('MATERIA_ID:', materia_id);
    console.log('TOPICO_ESPECIFICO:', topico_especifico);
    console.log('TEXTO_BASE:', texto_base ? texto_base.substring(0, 200) + '...' : '(vazio)');
    console.log('USER_ID:', user_id);
    console.log('-----------------------------------');

    if (!materia || !materia_id || !user_id) {
      return corsResponse({ error: 'Parâmetros faltando' }, 400);
    }

    if (!topico_especifico && !texto_base) {
      return corsResponse({ error: 'Forneça topico ou texto' }, 400);
    }

    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    console.log('API Key configurada:', apiKey ? 'SIM' : 'NÃO');
    
    if (!apiKey) {
      return corsResponse({ error: 'API key não configurada' }, 500);
    }

    const model = getModel();
    console.log('Modelo Gemini:', model);

    // Construir o prompt completo com as variáveis
    const prompt = `${SYSTEM_PROMPT}

Variáveis de entrada:
- MATERIA: ${materia}
- TOPICO_ESPECIFICO: ${topico_especifico || '(não especificado)'}
- TEXTO_BASE: ${texto_base || '(vazio)'}

Gere os flashcards agora.`;

    // Log do prompt completo enviado ao Gemini
    console.log('--- PROMPT ENVIADO AO GEMINI ---');
    console.log(prompt);
    console.log('--------------------------------');

    const geminiUrl = `${GEMINI_API_URL_BASE}/${model}:generateContent?key=${apiKey}`;
    console.log('Chamando Gemini API...');

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        },
      }),
    });

    console.log('Status da resposta Gemini:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      console.error('Erro da API Gemini:', err);
      return corsResponse({ error: 'Erro na API do Gemini', details: err }, 500);
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Tamanho da resposta:', text.length, 'caracteres');

    if (!text) {
      return corsResponse({ error: 'Resposta vazia da IA' }, 500);
    }

    // Usar parser mais robusto (já faz log da resposta)
    const jsonData = parseAIResponse(text);
    
    if (!jsonData) {
      return corsResponse({ error: 'Não foi possível parsear a resposta da IA' }, 500);
    }

    let flashcards = jsonData.flashcards;
    
    if (!flashcards && Array.isArray(jsonData)) {
      flashcards = jsonData;
    }

    if (!flashcards || !Array.isArray(flashcards)) {
      return corsResponse({ error: 'Formato inválido - não contém flashcards' }, 500);
    }

    if (flashcards.length !== 10) {
      return corsResponse({ error: 'Quantidade incorreta de flashcards', quantidade: flashcards.length }, 500);
    }

    // Validar cada flashcard
    for (let i = 0; i < flashcards.length; i++) {
      const card = flashcards[i];
      if (!card.pergunta || !card.alternativas || !card.resposta_correta) {
        return corsResponse({ error: `Flashcard ${i+1} incompleto` }, 500);
      }
      if (!Array.isArray(card.alternativas) || card.alternativas.length < 2 || card.alternativas.length > 3) {
        return corsResponse({ error: `Flashcard ${i+1} com alternativas inválidas` }, 500);
      }
      if (!card.alternativas.includes(card.resposta_correta)) {
        return corsResponse({ error: `Flashcard ${i+1} com resposta_correta inválida` }, 500);
      }
    }

    console.log('--- FLASHCARDS GERADOS ---');
    console.log('Quantidade:', flashcards.length);
    flashcards.forEach((card: any, i: number) => {
      console.log(`Card ${i+1}:`, {
        pergunta: card.pergunta.substring(0, 50) + '...',
        alternativas: card.alternativas,
        resposta_correta: card.resposta_correta
      });
    });
    console.log('--------------------------');

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

    console.log('Salvando no banco de dados...');
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
    console.log('=== SUCESSO! ===');
    console.log('Flashcards salvos:', insertedData.length);
    console.log('===========================================');

    return corsResponse({ success: true, count: flashcards.length, model });

  } catch (e) {
    console.error('Erro geral:', e);
    console.log('===========================================');
    return corsResponse({ error: String(e) }, 500);
  }
});
