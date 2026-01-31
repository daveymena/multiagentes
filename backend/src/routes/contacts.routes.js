import express from 'express';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/contacts
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('last_interaction', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({ info: 'MIGRATION_REQUIRED', message: 'Tabla contacts no encontrada' });
        }
        logger.error({ error }, 'Error fetching contacts from Supabase');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/contacts
 */
router.post('/', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { name, phone, tags } = req.body;

        const { data, error } = await supabase
            .from('contacts')
            .upsert({
                name,
                phone,
                tags,
                tenant_id: tenantId,
                last_interaction: new Date().toISOString()
            }, { onConflict: 'tenant_id,phone' })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({ info: 'MIGRATION_REQUIRED', message: 'Tabla contacts no encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/contacts/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', req.params.id)
            .eq('tenant_id', tenantId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/contacts/import
 */
router.post('/import', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { contacts } = req.body;

        if (!Array.isArray(contacts)) {
            return res.status(400).json({ error: 'Contacts must be an array' });
        }

        const formattedContacts = contacts.map(c => ({
            name: c.name,
            phone: c.phone,
            tags: c.tags || [],
            tenant_id: tenantId,
            last_interaction: new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('contacts')
            .upsert(formattedContacts, { onConflict: 'tenant_id,phone' });

        if (error) throw error;
        res.json({ success: true, count: contacts.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
