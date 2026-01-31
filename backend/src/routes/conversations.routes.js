import express from 'express';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/conversations
 * @desc Get all conversations for a tenant
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';

        // Obtenemos conversaciones
        const { data, error } = await supabase
            .from('conversations')
            .select(`*`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Traer nombres de agentes por separado si es necesario o simplificar
        const formatted = data.map(conv => ({
            id: conv.id,
            contactName: conv.contact_name || conv.contact_phone,
            contactPhone: conv.contact_phone,
            agentName: 'Agente IA', // Simplificado
            lastMessage: 'Ver detalles...', // Podríamos traer el último mensaje real
            time: new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: conv.status,
            unread: 0,
            messages: []
        }));

        res.json(formatted);
    } catch (error) {
        logger.error({ error: error.message }, 'Error fetching conversations');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/conversations/:id/messages
 * @desc Get messages for a conversation
 */
router.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted = data.map(m => ({
            id: m.id,
            content: m.content,
            sender: m.sender_type === 'user' ? 'user' : 'agent',
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
