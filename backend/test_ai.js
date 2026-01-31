import { Groq } from 'groq-sdk';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
    console.log('\n--- TESTING GROQ ---');
    try {
        console.log('Using API Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10));
        const models = await groq.models.list();
        console.log('GROQ CONNECTION: OK');
        console.log('Available Models (first 3):', models.data.slice(0, 3).map(m => m.id));

        const response = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: 'Hola, responde con "OK"' }
            ],
            model: 'llama3-8b-8192',
        });
        console.log('GROQ CHAT RESPONSE:', response.choices[0]?.message?.content);
    } catch (error) {
        console.error('GROQ ERROR:', error.message);
        if (error.response) console.error('GROQ DETAILS:', error.response.data);
    }
}

async function testOllama() {
    console.log('\n--- TESTING OLLAMA ---');
    const ollamaUrl = 'https://ollama-ollama.ginee6.easypanel.host';
    console.log('Ollama URL:', ollamaUrl);
    try {
        // Test health/tags
        const tags = await axios.get(`${ollamaUrl}/api/tags`).catch(e => {
            console.warn('Could not get tags, trying chat directly...');
            return { data: { models: [] } };
        });

        if (tags.data.models) {
            console.log('OLLAMA CONNECTION: OK');
            console.log('Available Models:', tags.data.models.map(m => m.name));
        }

        const model = tags.data.models?.[0]?.name || 'llama3.2:1b';
        console.log(`Testing chat with model: ${model}`);

        const response = await axios.post(`${ollamaUrl}/api/chat`, {
            model: model,
            messages: [
                { role: 'user', content: 'Hola, responde "OK"' }
            ],
            stream: false
        }, { timeout: 15000 });
        console.log('OLLAMA CHAT RESPONSE:', response.data.message?.content || response.data);
    } catch (error) {
        console.error('OLLAMA ERROR:', error.message);
        if (error.response) {
            console.error('OLLAMA DATA ERROR:', error.response.data);
        }
    }
}

async function runTests() {
    await testGroq();
    await testOllama();
    process.exit(0);
}

runTests();
