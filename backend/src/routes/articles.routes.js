import express from 'express';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

import { migrateArticlesFromPostgres } from '../services/migration.service.js';

const router = express.Router();

/**
 * @route POST /api/articles/migrate
 * @desc Migrate articles from external Postgres to Supabase
 */
router.post('/migrate', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const result = await migrateArticlesFromPostgres(tenantId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/articles
 */
router.get('/', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';

        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({
                info: 'MIGRATION_REQUIRED',
                message: 'La tabla articles no existe en Supabase.'
            });
        }
        logger.error({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        }, 'Error fetching articles from Supabase');
        res.status(500).json({ error: error.message, code: error.code });
    }
});

/**
 * @route POST /api/articles
 */
router.post('/', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { title, content, price, category, image_url } = req.body;

        const { data, error } = await supabase
            .from('articles')
            .insert([{
                title,
                content,
                price,
                category,
                image_url,
                tenant_id: tenantId
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            return res.status(200).json({ info: 'MIGRATION_REQUIRED', message: 'Tabla articles no encontrada' });
        }
        logger.error({ error }, 'Error creating article in Supabase');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/articles/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { error } = await supabase
            .from('articles')
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
 * @route PUT /api/articles/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { title, content, price, category, image_url } = req.body;

        const { data, error } = await supabase
            .from('articles')
            .update({
                title,
                content,
                price,
                category,
                image_url
            })
            .eq('id', req.params.id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        logger.error({ error }, 'Error updating article in Supabase');
        res.status(500).json({ error: error.message });
    }
});

export default router;
