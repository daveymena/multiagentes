import supabase from './backend/src/db/supabase.client.js';

async function check() {
    const { data, error, count } = await supabase
        .from('agents')
        .select('*', { count: 'exact' })
        .eq('tenant_id', 'demo_tenant');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total agents in DB:', data.length);
        console.log('Agent names:', data.map(a => a.name).join(', '));
    }
    process.exit(0);
}
check();
