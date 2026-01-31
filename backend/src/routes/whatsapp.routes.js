import express from 'express';
import whatsappService from '../services/whatsapp/baileys.service.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route POST /api/whatsapp/connect
 * @desc Initialize a new WhatsApp connection
 */
router.post('/connect', async (req, res) => {
    try {
        const { sessionId, tenantId } = req.body;
        console.log('--- NUEVA PETICIÓN DE CONEXIÓN ---');
        console.log('SessionID:', sessionId);
        console.log('TenantID:', tenantId);

        if (!sessionId) {
            console.log('Error: SessionID ausente');
            return res.status(400).json({ error: 'Session ID is required' });
        }

        logger.info({ sessionId, tenantId }, 'Connecting WhatsApp...');

        // Start connection in background (QR will be sent via WebSocket)
        whatsappService.connect(sessionId, tenantId);

        res.json({
            status: 'initializing',
            message: 'Connection process started. Watch for QR code via WebSocket.'
        });

    } catch (error) {
        logger.error({ error }, 'Error in /connect');
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/whatsapp/status/:sessionId
 * @desc Check connection status
 */
router.get('/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const status = whatsappService.getStatus(sessionId);
    res.json({ status });
});

/**
 * @route POST /api/whatsapp/disconnect/:sessionId
 * @desc Disconnect WhatsApp
 */
router.post('/disconnect/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await whatsappService.disconnect(sessionId);
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/whatsapp/send-message
 * @desc Send a text message
 */
router.post('/send-message', async (req, res) => {
    try {
        const { sessionId, jid, text } = req.body;
        const result = await whatsappService.sendMessage(sessionId, jid, text);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
