import aiService from './src/services/ai.service.js';
import logger from './src/utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAIService() {
    console.log('\n--- TESTING AI SERVICE (GROQ) ---');
    // Using a known tenant_id from previous check
    const tenantId = 'demo_tenant';
    const response = await aiService.processMessage('test-session', tenantId, 'user-phone', 'Hola, que productos tienes?', null);
    console.log('AI RESPONSE (GROQ):', response);

    console.log('\n--- TESTING AI SERVICE (OLLAMA) ---');
    // We can simulate an agent with ollama provider
    // Since we don't want to change the DB, we can just rely on the default if it skips agent fetching
    // But currently processMessage fetches from DB.
}

testAIService();
