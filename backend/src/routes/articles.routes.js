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

        // Fallback to demo articles if user has none
        if (data.length === 0 && tenantId !== 'demo_tenant') {
            const { data: demoData } = await supabase
                .from('articles')
                .select('*')
                .eq('tenant_id', 'demo_tenant')
                .order('created_at', { ascending: false });

            return res.json(demoData || []);
        }

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

/**
 * @route POST /api/articles/:id/auto-image
 * @desc Auto-finds a better image for a specific article
 */
import imageService from '../services/image.service.js';

router.post('/:id/auto-image', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { id } = req.params;

        // 1. Get article title
        const { data: article, error: fetchError } = await supabase
            .from('articles')
            .select('title, category, content')
            .eq('id', id)
            .single();

        if (fetchError || !article) throw new Error('Article not found');

        // 2. Find image
        const newImageUrl = await imageService.findImage(article.title, article.content || '', article.category);

        // 3. Update
        const { data: updated, error: updateError } = await supabase
            .from('articles')
            .update({ image_url: newImageUrl })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json(updated);
    } catch (error) {
        logger.error({ error }, 'Error finding auto-image');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/articles/auto-fix-images
 * @desc Update all articles that have no image or placeholders
 */
router.post('/auto-fix-images', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'] || 'demo_tenant';
        const { forceAll } = req.body;

        // 1. Get all articles
        let query = supabase.from('articles').select('*').eq('tenant_id', tenantId);

        // If not forcing all, only get those without valid images
        if (!forceAll) {
            // Logic to filter bad images is hard in SQL, better to fetch all and filter in JS
            // or check for null/empty
        }

        const { data: articles, error } = await query;
        if (error) throw error;

        if (!articles || articles.length === 0) return res.json({ processed: 0 });

        logger.info(`Processing images for ${articles.length} articles...`);

        let processedCount = 0;
        const results = [];

        // Process sequentially to avoid rate limits on image services
        for (const article of articles) {
            // Check if needs update
            const isMegapack = article.title?.toLowerCase().includes('megapack') || article.title?.toLowerCase().includes('mega pack');
            const hasBadImage = !article.image_url ||
                article.image_url.includes('placeholder') ||
                article.image_url.includes('unsplash.com') ||
                article.image_url.length < 10 ||
                isMegapack; // Force re-process megapacks with the improved logic

            if (forceAll || hasBadImage) {
                const newUrl = await imageService.findImage(article.title, article.content || '', article.category);

                await supabase
                    .from('articles')
                    .update({ image_url: newUrl })
                    .eq('id', article.id);

                results.push({ id: article.id, title: article.title, newUrl });
                processedCount++;

                // Small delay acting nicely
                await new Promise(r => setTimeout(r, 500));
            }
        }

        res.json({ processed: processedCount, details: results });

    } catch (error) {
        logger.error({ error }, 'Error batch processing images');
        res.status(500).json({ error: error.message });
    }
});

export default router;
