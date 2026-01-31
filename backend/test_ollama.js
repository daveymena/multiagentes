import axios from 'axios';
const url = 'https://ollama-ollama.ginee6.easypanel.host';

async function testOllama() {
    console.log('Testing Ollama at:', url);
    try {
        const response = await axios.post(`${url}/api/chat`, {
            model: 'llama3.2:1b',
            messages: [{ role: 'user', content: 'hola' }],
            stream: false
        }, { timeout: 30000 });
        console.log('OLLAMA RESPONSE:', response.data.message.content);
    } catch (e) {
        console.error('OLLAMA FAIL:', e.message);
    }
}

testOllama();
