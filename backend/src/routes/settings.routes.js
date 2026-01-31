import express from 'express';
import logger from '../utils/logger.js';
import supabase from '../db/supabase.client.js';

const router = express.Router();

// GET /api/settings/keys
router.get('/keys', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];

        // Check if profiles has api_keys column first (graceful degradation)
        // In a real production app, we would assume migration ran.
        // Here we just return empty or catch error.

        const { data, error } = await supabase
            .from('profiles')
            .select('api_keys')
            .eq('id', tenantId) // Assuming tenantId maps to profile id for now, or we need a proper mapping
            .single();

        if (error) {
            // If column doesn't exist or profile not found, return empty
            return res.json({});
        }

        res.json(data?.api_keys || {});
    } catch (error) {
        logger.error({ error }, 'Error fetching settings keys');
        res.status(500).json({});
    }
});

// POST /api/settings/keys
router.post('/keys', async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const { api_keys } = req.body;

        if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

        // Update profiles table
        // Note: For this to work, the user needs to execute the SQL migration adding 'api_keys' column.
        // If it fails, the frontend handles it by falling back to localStorage.

        const { error } = await supabase
            .from('profiles')
            .update({ api_keys: api_keys })
            .eq('id', tenantId); // Improve matching logic if tenant_id != user.id

        if (error) {
            logger.error({ error }, 'Error saving api keys to supabase');
            return res.status(500).json({ error: 'Database update failed. Have you run the migration?' });
        }

        logger.info({ tenantId }, 'API Keys updated');
        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Error saving settings keys');
        res.status(500).json({ error: error.message });
    }
});

export default router;
