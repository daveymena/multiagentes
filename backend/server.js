import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './src/utils/logger.js';
import { initSocket } from './src/socket.js';
import whatsappRoutes from './src/routes/whatsapp.routes.js';
import agentsRoutes from './src/routes/agents.routes.js';
import contactsRoutes from './src/routes/contacts.routes.js';
import articlesRoutes from './src/routes/articles.routes.js';


import initDb from './src/db/init.js';

// Cargar variables de entorno
dotenv.config();

// Initialize DB
initDb().then(() => {
    logger.info('Database initialized');
}).catch(err => {
    logger.error({ err }, 'Failed to initialize database');
});


const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

const PORT = process.env.PORT || 3001;


// Middleware de seguridad - Relajado para debug
app.use(helmet({
    contentSecurityPolicy: false // Desactivar CSP para facilitar escaneo de QR y sockets
}));

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging detallado
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.method === 'POST') console.log('Body:', JSON.stringify(req.body));
    next();
});


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/articles', articlesRoutes);



app.get('/api', (req, res) => {
    res.json({
        message: 'Multi-Agent WhatsApp API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            whatsapp: '/api/whatsapp',
            agents: '/api/agents',
            conversations: '/api/conversations'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error({ err, path: req.path }, 'Server error');
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            path: req.path
        }
    });
});

// Start server
httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 WebSocket server ready`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

export { app };

