import supabase from './src/db/supabase.client.js';
import logger from './src/utils/logger.js';

async function testConnection() {
    try {
        const { data, error } = await supabase.from('agents').select('*').limit(1);
        if (error) {
            logger.error({ error }, 'Supabase connection failed or table missing');
        } else {
            logger.info('Supabase connection successful!');
            console.log('Sample data:', data);
        }
    } catch (err) {
        logger.error({ err }, 'Unexpected error testing connection');
    }
    process.exit(0);
}

testConnection();
