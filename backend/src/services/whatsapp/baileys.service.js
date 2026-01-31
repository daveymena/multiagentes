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
import conversationService from '../conversation.service.js';


class WhatsAppService {
    constructor() {
        this.sessions = new Map();
        this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './auth_info_baileys';

        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    async connect(sessionId, tenantId, agentId = null) {
        try {
            console.log(`[BAILEYS] Iniciando conexión para sesión: ${sessionId}, Agent: ${agentId}`);

            if (this.sessions.has(sessionId)) {
                const session = this.sessions.get(sessionId);
                if (agentId) session.agentId = agentId;
                getIO().emit(`status:${sessionId}`, 'connecting');
                return session.sock;
            }

            getIO().emit(`status:${sessionId}`, 'connecting');
            const sessionFolder = path.join(this.sessionPath, sessionId);

            const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
            const { version } = await fetchLatestBaileysVersion();

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

            this.sessions.set(sessionId, { sock, agentId });


            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    getIO().emit(`qr:${sessionId}`, qr);
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error instanceof Boom)
                        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                        : true;

                    if (shouldReconnect) {
                        this.sessions.delete(sessionId);
                        this.connect(sessionId, tenantId, agentId);
                    } else {
                        this.sessions.delete(sessionId);
                        getIO().emit(`status:${sessionId}`, 'disconnected');
                    }
                } else if (connection === 'open') {
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
                                const currentSession = this.sessions.get(sessionId);
                                let assignedAgentId = currentSession?.agentId;

                                // Fallback: Si no hay agente asignado a la sesión, buscamos el activo para este tenant
                                if (!assignedAgentId) {
                                    logger.info('No agent assigned to session, looking for active agent fallback');
                                    const { data: fallbackAgents } = await supabase
                                        .from('agents')
                                        .select('id')
                                        .eq('tenant_id', tenantId)
                                        .eq('status', 'active')
                                        .limit(1);

                                    if (fallbackAgents?.length > 0) {
                                        assignedAgentId = fallbackAgents[0].id;
                                        // Guardar en la sesión para futuras consultas
                                        currentSession.agentId = assignedAgentId;
                                    }
                                }

                                try {
                                    logger.info({ from, text, assignedAgentId }, 'Incoming WhatsApp message');

                                    // PERSISTENCIA: Obtener o crear conversación
                                    let conversationId = null;
                                    if (assignedAgentId) {
                                        const conv = await conversationService.getOrCreateConversation(assignedAgentId, tenantId, from);
                                        if (conv) {
                                            conversationId = conv.id;
                                            await conversationService.saveMessage(conversationId, text, 'user');
                                        }
                                    }

                                    const aiResponse = await aiService.processMessage(sessionId, tenantId, from, text, assignedAgentId);

                                    if (aiResponse) {
                                        await this.sendMessage(sessionId, from, aiResponse);

                                        // PERSISTENCIA: Guardar respuesta de la IA
                                        if (conversationId) {
                                            await conversationService.saveMessage(conversationId, aiResponse, 'agent');
                                        }
                                    }
                                } catch (aiErr) {
                                    logger.error({ aiErr }, 'Failed to get AI response');
                                }

                                logger.info({ sessionId, from }, 'Emitting real-time message event');
                                getIO().emit(`message:${sessionId}`, {
                                    from,
                                    text,
                                    timestamp: new Date().toISOString(),
                                    sender: 'user',
                                    raw: msg
                                });
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
        const session = this.sessions.get(sessionId);
        if (session) {
            await session.sock.logout();
            this.sessions.delete(sessionId);
            return true;
        }
        return false;
    }

    setAgent(sessionId, agentId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.agentId = agentId;
            return true;
        }
        return false;
    }

    getStatus(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return 'disconnected';
        return session.sock.ws.isOpen ? 'connected' : 'connecting';
    }

    async sendMessage(sessionId, jid, text) {
        const session = this.sessions.get(sessionId);
        if (!session) throw new Error('Session not found');
        const sock = session.sock;

        // Simulamos un retraso de "pensamiento" más largo (2-5 segundos)
        const minThinkDelay = 2000;
        const maxThinkDelay = 5000;
        const thinkDelay = Math.floor(Math.random() * (maxThinkDelay - minThinkDelay + 1) + minThinkDelay);
        await new Promise(resolve => setTimeout(resolve, thinkDelay));

        // Simulamos escritura (composing) durante un tiempo proporcional al mensaje
        const typingTime = Math.min(Math.max(text.length * 50, 3000), 7000); // Entre 3 y 7 segundos

        await sock.sendPresenceUpdate('composing', jid);
        await new Promise(resolve => setTimeout(resolve, typingTime));
        await sock.sendPresenceUpdate('paused', jid);

        const result = await sock.sendMessage(jid, { text });

        // Emitir evento para que se vea en la interfaz (mensajes enviados por la IA)
        getIO().emit(`message:${sessionId}`, {
            from: 'me',
            text,
            timestamp: new Date().toISOString(),
            sender: 'agent'
        });

        return result;
    }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
