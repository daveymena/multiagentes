import express from 'express';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/agents
 * @desc Get all agents for a tenant
 */
router.get('/', async (req, res) => {
    try {
        // Always use demo_tenant for now so all users see the pre-created agents
        const tenantId = 'demo_tenant';

        console.log(`\n=== AGENTS GET REQUEST ===`);
        console.log(`Fetching agents for: ${tenantId}`);

        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log(`✅ Returning ${data?.length || 0} agents`);
        res.json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({ info: 'MIGRATION_REQUIRED', message: 'Tabla agents no encontrada' });
        }
        logger.error({ error }, 'Error fetching agents from Supabase');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/agents
 * @desc Create a new agent
 */
router.post('/', async (req, res) => {
    try {
        const tenantId = 'demo_tenant';
        const { name, description, type, aiProvider, welcomeMessage } = req.body;

        const { data, error } = await supabase
            .from('agents')
            .insert([{
                name,
                description,
                type: type || 'sales',
                ai_provider: aiProvider || 'lovable_ai',
                welcome_message: welcomeMessage,
                tenant_id: tenantId
            }])
            .select()
            .single();

        if (error) throw error;
        logger.info({ agentId: data.id, tenantId }, 'New agent created in Supabase');
        res.status(201).json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({ info: 'MIGRATION_REQUIRED', message: 'Tabla agents no encontrada' });
        }
        logger.error({ error }, 'Error creating agent in Supabase');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PUT /api/agents/:id
 * @desc Update an existing agent
 */
router.put('/:id', async (req, res) => {
    try {
        const tenantId = 'demo_tenant';
        const { id } = req.params;
        const { name, description, type, aiProvider, welcomeMessage, status } = req.body;

        const { data, error } = await supabase
            .from('agents')
            .update({
                name,
                description,
                type,
                ai_provider: aiProvider,
                welcome_message: welcomeMessage,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        logger.info({ agentId: id, tenantId }, 'Agent updated in Supabase');
        res.json(data);
    } catch (error) {
        logger.error({ error }, 'Error updating agent');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PATCH /api/agents/:id/status
 * @desc Update agent status only
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const tenantId = 'demo_tenant';
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('agents')
            .update({ status })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/agents/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = 'demo_tenant';
        const { id } = req.params;
        const { error } = await supabase
            .from('agents')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Error deleting agent');
        res.status(500).json({ error: error.message });
    }
});

export default router;
