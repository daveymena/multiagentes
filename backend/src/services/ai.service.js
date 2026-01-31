import { Groq } from 'groq-sdk';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

class AIService {
    /**
     * Procesa un mensaje entrante y genera una respuesta inteligente
     */
    async processMessage(sessionId, tenantId, from, text) {
        try {
            logger.info({ sessionId, tenantId, from }, 'Processing AI response');

            // 1. Buscar el agente configurado para esta sesión/tenant
            const { data: agents, error: agentError } = await supabase
                .from('agents')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('status', 'active')
                .limit(1);

            if (agentError || !agents || agents.length === 0) {
                logger.warn({ tenantId }, 'No active agent found for this tenant');
                return null;
            }

            const agent = agents[0];

            // 2. BUSQUEDA INTELIGENTE (Base de Conocimiento)
            // Por ahora hacemos una búsqueda simple por texto en Supabase
            // En el futuro esto usará Embeddings (Vectores)
            const { data: articles, error: kbError } = await supabase
                .from('articles')
                .select('title, content, price, category')
                .eq('tenant_id', tenantId);

            let knowledgeContext = "";
            if (articles && articles.length > 0) {
                knowledgeContext = "BASE DE CONOCIMIENTO DISPONIBLE:\n";
                articles.forEach(art => {
                    knowledgeContext += `- ${art.title}: ${art.content} ${art.price ? `(Precio: $${art.price})` : ''}\n`;
                });
            }

            // 3. Obtener historial reciente (opcional, por ahora solo el mensaje actual)

            // 4. Construir Prompt
            const systemPrompt = `
                Eres un asistente de IA llamado "${agent.name}".
                Personalidad/Instrucciones: ${agent.description}
                
                ${knowledgeContext}
                
                REGLAS:
                - Responde de forma natural y amigable por WhatsApp.
                - Usa la información de la base de conocimiento arriba si es relevante.
                - Si no sabes algo, dile que un humano le contactará pronto.
                - Mantén las respuestas cortas y al grano.
            `;

            const response = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                model: 'llama3-8b-8192',
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0]?.message?.content;
        } catch (error) {
            logger.error({ error }, 'Error in AI Service');
            return "Lo siento, tuve un pequeño problema técnico. ¿Podrías repetir eso?";
        }
    }
}

export const aiService = new AIService();
export default aiService;
