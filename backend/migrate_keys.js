import supabase from './src/db/supabase.client.js';

async function runMigration() {
    console.log('Running API Keys migration...');
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;
        `
    });

    // Si rpc no existe (común en setups nuevos), intentamos vía REST si tenemos permisos, 
    // pero usualmente DDL requiere conexión directa o Dashboard.
    // Como alternativa, usaremos la librería postgres de node si está disponible en backend.

    if (error) {
        console.error('RPC Error (Expected if exec_sql not set up):', error);
        console.log('Skipping direct DB migration via client. Please run SQL manually in Supabase Dashboard SQL Editor:');
        console.log(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}'::jsonb;`);
    } else {
        console.log('Migration via RPC successful!');
    }
}

runMigration();
