import { Groq } from 'groq-sdk';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

class AIService {
    /**
     * Procesa un mensaje entrante y genera una respuesta inteligente
     */
    async processMessage(sessionId, tenantId, from, text, agentId = null) {
        try {
            logger.info({ sessionId, tenantId, from, agentId, text }, '--- START AI PROCESS ---');

            // 1. Buscar el agente configurado
            let query = supabase
                .from('agents')
                .select('*')
                .eq('tenant_id', tenantId);

            if (agentId) {
                query = query.eq('id', agentId);
            } else {
                query = query.eq('status', 'active');
            }

            const { data: agents, error: agentError } = await query.limit(1);

            if (agentError) {
                logger.error({ agentError }, 'Supabase error fetching agent');
                throw agentError;
            }

            if (!agents || agents.length === 0) {
                logger.warn({ tenantId, agentId }, 'No active agent found');
                return "Hola, en este momento no tengo un agente activo para responderte. Por favor intenta más tarde.";
            }

            const agent = agents[0];
            logger.info({ agentId: agent.id, agentName: agent.name }, 'Agent context loaded');

            // 2. BUSQUEDA INTELIGENTE (Base de Conocimiento)
            const { data: articles, error: kbError } = await supabase
                .from('articles')
                .select('*')
                .eq('tenant_id', tenantId);

            if (kbError) {
                logger.warn({ kbError }, 'Error fetching knowledge base, continuing without it');
            }

            // 2. Filtrar y preparar contexto inteligente
            let knowledgeContext = "No hay productos cargados específicamente.";
            if (articles && articles.length > 0) {
                // Buscamos artículos relevantes para la consulta actual
                const userText = text.toLowerCase();
                const relevant = articles.filter(a => {
                    const title = (a.title || "").toLowerCase();
                    const content = (a.content || "").toLowerCase();
                    // Búsqueda simple por palabras clave
                    return userText.includes('excel') || userText.includes('curso') ||
                        title.split(' ').some(w => w.length > 3 && userText.includes(w)) ||
                        userText.split(' ').some(w => w.length > 3 && title.includes(w));
                });

                const articlesToShow = relevant.length > 0 ? relevant : articles.slice(0, 15);

                knowledgeContext = articlesToShow.map(a =>
                    `- PRODUCTO: ${a.title}\n  DETALLES: ${a.content}\n  PRECIO: ${a.price ? `$${a.price} COP` : 'Consultar'}`
                ).join('\n\n');

                logger.info({
                    totalArticles: articles.length,
                    relevantFound: relevant.length,
                    text
                }, 'Knowledge base context prepared');
            }

            // 3. Obtener historial (No implementado aún)

            // 4. Construir Prompt
            const systemPrompt = `
                Eres un experto VENDEDOR PROFESIONAL y ASESOR COMERCIAL llamado "${agent.name}".
                
                TU MISIÓN: Convertir interesados en clientes fieles siguiendo un proceso de venta consultiva.
                
                ESTILO DE COMUNICACIÓN:
                - Empático, profesional y persuasivo.
                - Usa un lenguaje natural de WhatsApp (puedes usar emojis con moderación).
                - NUNCA respondas con párrafos gigantes; mantén la fluidez.
                
                PROCESO DE VENTA (Sigue estas etapas):
                1. CONEXIÓN Y SALUDO: Saluda amablemente y agradece el contacto.
                2. DESCUBRIMIENTO (CRÍTICO): Antes de ofrecer precios o productos, haz 1 o 2 preguntas para entender qué necesita realmente el cliente, para qué lo usará y qué presupuesto tiene aproximado. 
                3. ASESORÍA: Basado en su necesidad, busca en la BASE DE CONOCIMIENTO y ofrece la mejor opción. 
                4. VALOR ANTES QUE PRECIO: Resalta los beneficios antes de dar el precio.
                5. CIERRE: Si el cliente muestra interés, intenta concretar el siguiente paso (visita, pago, envío).
                
                BASE DE CONOCIMIENTO:
                ${knowledgeContext || "No hay productos cargados específicamente, pero puedes atender dudas generales del negocio."}
                
                REGLAS DE ORO:
                - INTERPRETACIÓN INTELIGENTE: Ignora errores de ortografía, falta de tildes o abreviaturas comunes de WhatsApp (ej: "exel" es Excel, "kiero" es quiero, "info" es información).
                - BÚSQUEDA POR INTENCIÓN: No busques solo la palabra exacta. Si el cliente pregunta por "clases de computador", busca cursos relacionados como el de Excel o Marketing.
                - MONEDA: Todos los precios son en PESOS COLOMBIANOS (COP). Usa el formato $1.000.000 COP.
                - PACIENCIA: No atosigues con todas las preguntas a la vez. Ve paso a paso.
                - HONESTIDAD: Si confirmas que NO tenemos algo similar, ofrece otra opción o di que consultarás.
                - ANÁLISIS: Tómate un momento para analizar el historial y la intención del usuario.
            `;

            const provider = agent.ai_provider || 'groq';
            // IMPORTANTE: Asegurarnos de usar un modelo válido para Groq si el del agente es inválido o nulo
            const modelToUse = agent.ai_model || (provider === 'ollama' ? 'llama3.2:1b' : 'llama-3.1-8b-instant');

            logger.info({ provider, modelToUse }, 'AI Config selected');

            let aiResponseText = "";

            if (provider === 'ollama') {
                const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host';
                logger.info({ ollamaUrl, model: modelToUse }, 'Calling Ollama...');

                const response = await axios.post(`${ollamaUrl}/api/chat`, {
                    model: modelToUse,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ],
                    stream: false
                }, { timeout: 45000 });

                aiResponseText = response.data.message?.content || "";
            } else {
                logger.info({ model: modelToUse }, 'Calling Groq...');
                const response = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ],
                    model: modelToUse,
                    temperature: 0.7,
                    max_tokens: 500
                });
                aiResponseText = response.choices[0]?.message?.content || "";
            }

            logger.info({ responseLength: aiResponseText.length }, '--- END AI PROCESS SUCCESS ---');
            return aiResponseText;

        } catch (error) {
            logger.error({
                error: error.message,
                stack: error.stack,
                details: error.response?.data,
                sessionId,
                tenantId
            }, 'CRITICAL ERROR IN AI SERVICE');
            return "Lo siento, tuve un pequeño problema técnico. ¿Podrías repetir eso?";
        }
    }
}

export const aiService = new AIService();
export default aiService;
