import { query } from './postgres.js';
import logger from '../utils/logger.js';

const initDb = async () => {
    try {
        logger.info('Initializing Database Schema...');

        // Agents Table
        await query(`
            CREATE TABLE IF NOT EXISTS agents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id TEXT DEFAULT 'demo_tenant',
                name TEXT NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'sales',
                status TEXT DEFAULT 'active',
                ai_provider TEXT DEFAULT 'lovable_ai',
                welcome_message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Contacts Table
        await query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id TEXT DEFAULT 'demo_tenant',
                name TEXT,
                phone TEXT NOT NULL,
                tags TEXT[],
                last_interaction TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tenant_id, phone)
            )
        `);

        // Articles Table (Product Catalog / Knowledge Base)
        await query(`
            CREATE TABLE IF NOT EXISTS articles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id TEXT DEFAULT 'demo_tenant',
                title TEXT NOT NULL,
                content TEXT,
                price DECIMAL(10, 2),
                category TEXT,
                image_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Messages Table
        await query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id TEXT DEFAULT 'demo_tenant',
                contact_id UUID REFERENCES contacts(id),
                agent_id UUID REFERENCES agents(id),
                content TEXT NOT NULL,
                sender TEXT NOT NULL, -- 'contact', 'agent', 'system'
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migrations (Add tenant_id if not exists)
        const tables = ['agents', 'contacts', 'articles', 'messages'];
        for (const table of tables) {
            await query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'tenant_id') THEN
                        ALTER TABLE ${table} ADD COLUMN tenant_id TEXT DEFAULT 'demo_tenant';
                    END IF;
                END $$;
            `);
        }

        logger.info('Database Schema Initialized Successfully');
    } catch (error) {
        logger.error({ error }, 'Error initializing database');
        process.exit(1);
    }
};

export default initDb;
