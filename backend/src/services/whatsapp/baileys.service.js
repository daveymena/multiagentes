import {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger.js';
import { getIO } from '../../socket.js';
import aiService from '../ai.service.js';


class WhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './auth_info_baileys';

        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    async connect(sessionId, tenantId) {
        try {
            console.log(`[BAILEYS] Iniciando conexión para sesión: ${sessionId}`);

            if (this.sessions.has(sessionId)) {
                console.log(`[BAILEYS] Sesión ${sessionId} ya existe. Reusando socket.`);
                const sock = this.sessions.get(sessionId);
                getIO().emit(`status:${sessionId}`, 'connecting');
                return sock;
            }

            getIO().emit(`status:${sessionId}`, 'connecting');
            const sessionFolder = path.join(this.sessionPath, sessionId);
            console.log(`[BAILEYS] Cargando auth en: ${sessionFolder}`);

            const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
            console.log(`[BAILEYS] Auth cargada correctamente`);

            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`[BAILEYS] Usando Baileys v${version.join('.')} (Latest: ${isLatest})`);

            const sock = makeWASocket({
                version,
                printQRInTerminal: false,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, logger),
                },
                browser: Browsers.macOS('Desktop'),
                syncFullHistory: false,
                markOnlineOnConnect: true,
            });

            console.log(`[BAILEYS] Socket creado para sesión: ${sessionId}`);
            this.sessions.set(sessionId, sock);


            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    logger.info({ sessionId }, 'New QR Code generated');
                    getIO().emit(`qr:${sessionId}`, qr);
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error instanceof Boom)
                        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                        : true;

                    logger.info({ sessionId, reason: lastDisconnect.error }, 'Connection closed');

                    if (shouldReconnect) {
                        this.sessions.delete(sessionId);
                        this.connect(sessionId, tenantId);
                    } else {
                        this.sessions.delete(sessionId);
                        logger.info({ sessionId }, 'Connection permanent closed (logged out)');
                        getIO().emit(`status:${sessionId}`, 'disconnected');
                    }
                } else if (connection === 'open') {
                    logger.info({ sessionId }, 'Connection opened');
                    getIO().emit(`status:${sessionId}`, 'connected');
                }
            });

            // Listen for messages
            sock.ev.on('messages.upsert', async (m) => {
                if (m.type === 'notify') {
                    for (const msg of m.messages) {
                        if (!msg.key.fromMe && msg.message) {
                            const from = msg.key.remoteJid;
                            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

                            if (text) {
                                logger.info({ sessionId, from }, 'New message received');

                                // IA Logic
                                try {
                                    const aiResponse = await aiService.processMessage(sessionId, tenantId, from, text);
                                    if (aiResponse) {
                                        await this.sendMessage(sessionId, from, aiResponse);
                                    }
                                } catch (aiErr) {
                                    logger.error({ aiErr }, 'Failed to get AI response');
                                }

                                getIO().emit(`message:${sessionId}`, msg);
                            }
                        }
                    }
                }
            });



            return sock;
        } catch (error) {
            console.error(`[BAILEYS ERROR] Fallo crítico en sesión ${sessionId}:`, error);
            getIO().emit(`status:${sessionId}`, 'disconnected');
            throw error;
        }
    }


    async disconnect(sessionId) {
        const sock = this.sessions.get(sessionId);
        if (sock) {
            await sock.logout();
            this.sessions.delete(sessionId);
            return true;
        }
        return false;
    }

    getStatus(sessionId) {
        const sock = this.sessions.get(sessionId);
        if (!sock) return 'disconnected';
        return sock.ws.isOpen ? 'connected' : 'connecting';
    }

    async sendMessage(sessionId, jid, text) {
        const sock = this.sessions.get(sessionId);
        if (!sock) throw new Error('Session not found');

        // Simple anti-ban delay
        const minDelay = parseInt(process.env.ANTIBAN_MIN_DELAY) || 1000;
        const maxDelay = parseInt(process.env.ANTIBAN_MAX_DELAY) || 3000;
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate typing
        await sock.sendPresenceUpdate('composing', jid);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sock.sendPresenceUpdate('paused', jid);

        return await sock.sendMessage(jid, { text });
    }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
