import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

class ConversationService {
    async getOrCreateConversation(agentId, tenantId, contactPhone, contactName = null) {
        try {
            logger.info({ agentId, tenantId, contactPhone }, 'getOrCreateConversation called');
            // Buscamos conversación existente para este contacto y agente
            const { data: existing, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('agent_id', agentId)
                .eq('contact_phone', contactPhone)
                .limit(1)
                .maybeSingle();

            if (existing) {
                logger.info({ convId: existing.id }, 'Existing conversation found');
                // Actualizar contacto si existe
                await this.syncContact(tenantId, contactPhone, contactName);
                return existing;
            }

            logger.info('Creating new conversation');
            // Si no existe, la creamos
            // Buscamos el user_id (tenant_id en esta tabla) REAL del agente
            const { data: agentData, error: agentErr } = await supabase
                .from('agents')
                .select('tenant_id')
                .eq('id', agentId)
                .single();

            if (agentErr) logger.error({ agentErr }, 'Error fetching agent for user_id');

            let userId = agentData?.tenant_id;

            // Fallback total si no hay user_id (usamos el perfil encontrado en la búsqueda anterior como backup)
            if (!userId) {
                const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
                userId = profile?.id;
            }

            if (!userId) throw new Error('No user_id found to associate with conversation');

            // Crear contacto antes de la conversación
            await this.syncContact(tenantId, contactPhone, contactName);

            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{
                    agent_id: agentId,
                    user_id: userId,
                    contact_phone: contactPhone,
                    contact_name: contactName || contactPhone,
                    status: 'open',
                    last_message_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) {
                logger.error({ createError, userId, agentId }, 'Error creating conversation record');
                return null;
            }

            logger.info({ convId: newConv.id }, 'New conversation created successfully');
            return newConv;
        } catch (error) {
            logger.error({ error: error.message, agentId, contactPhone }, 'Failed in getOrCreateConversation');
            return null;
        }
    }

    async syncContact(tenantId, phone, name) {
        try {
            // Limpiar el JID para guardar solo el número si es necesario
            const cleanPhone = phone.split('@')[0];

            await supabase
                .from('contacts')
                .upsert({
                    tenant_id: tenantId,
                    phone: cleanPhone,
                    name: name || cleanPhone,
                    last_interaction: new Date().toISOString()
                }, { onConflict: 'tenant_id,phone' });
        } catch (error) {
            logger.error({ error: error.message }, 'Error in syncContact');
        }
    }

    async saveMessage(conversationId, content, senderType) {
        try {
            logger.info({ conversationId, senderType, contentLength: content?.length }, 'Attempting to save message');
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    conversation_id: conversationId,
                    content: content,
                    sender_type: senderType,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                logger.error({ error, conversationId }, 'Error saving message to DB');
            } else {
                logger.info({ messageId: data?.[0]?.id }, 'Message saved successfully');
                // Actualizar timestamp de la conversación
                await supabase
                    .from('conversations')
                    .update({ last_message_at: new Date().toISOString() })
                    .eq('id', conversationId);
            }
        } catch (error) {
            logger.error({ error: error.message, conversationId }, 'Failed in saveMessage');
        }
    }
}

export default new ConversationService();
