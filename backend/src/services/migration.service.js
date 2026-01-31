import { query } from '../db/postgres.js';
import supabase from '../db/supabase.client.js';
import logger from '../utils/logger.js';

/**
 * Script para migrar artículos de PostgreSQL externo a Supabase
 */
export const migrateArticlesFromPostgres = async (tenantId = 'demo_tenant') => {
    try {
        logger.info('Iniciando migración de artículos desde PostgreSQL a Supabase...');

        // 1. Extraer artículos de PostgreSQL
        const pgResult = await query('SELECT title, content, price, category, image_url FROM articles');
        const articles = pgResult.rows;

        if (articles.length === 0) {
            logger.info('No hay artículos en PostgreSQL para migrar.');
            return { success: true, count: 0 };
        }

        logger.info(`Extraídos ${articles.length} artículos de PostgreSQL. Insertando en Supabase...`);

        // 2. Preparar datos para Supabase (añadir tenant_id)
        const formattedArticles = articles.map(art => ({
            ...art,
            tenant_id: tenantId
        }));

        // 3. Insertar en Supabase (usamos upsert por si ya existen)
        const { data, error } = await supabase
            .from('articles')
            .upsert(formattedArticles, { onConflict: 'tenant_id,title' }); // Asumiendo un constraint de unicidad en title para evitar duplicados en la migración

        if (error) {
            if (error.code === '42P01') {
                throw new Error('La tabla "articles" no existe en Supabase. Por favor, ejecuta el SQL en config_supabase.md primero.');
            }
            throw error;
        }

        logger.info('Migración de artículos completada con éxito.');
        return { success: true, count: articles.length };
    } catch (error) {
        logger.error({ error }, 'Error durante la migración de artículos');
        throw error;
    }
};

export default migrateArticlesFromPostgres;
