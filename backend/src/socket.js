import { Server } from 'socket.io';
import logger from './utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        logger.info({ socketId: socket.id }, 'Client connected via WebSocket');

        socket.on('disconnect', () => {
            logger.info({ socketId: socket.id }, 'Client disconnected');
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
