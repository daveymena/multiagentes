import supabase from './src/db/supabase.client.js';
import logger from './src/utils/logger.js';

const articles = [
    // E-commerce
    { title: "Smartphone X-100", content: "Lo último en tecnología con cámara de 108MP y batería de larga duración.", price: 799.99, category: "DIGITAL", tenant_id: "demo_tenant" },
    { title: "Vestido de Noche Elegante", content: "Vestido de seda color azul medianoche para eventos especiales. Tallas S, M, L.", price: 120.00, category: "PHYSICAL", tenant_id: "demo_tenant" },

    // Salud
    { title: "Consulta Médica General", content: "Valoración médica presencial o virtual por profesional altamente calificado.", price: 50.00, category: "SERVICES", tenant_id: "demo_tenant" },
    { title: "Limpieza Dental Profunda", content: "Procedimiento completo de higiene bucal con eliminación de sarro y pulido.", price: 80.00, category: "SERVICES", tenant_id: "demo_tenant" },

    // Inmobiliaria
    { title: "Apartamento Vista al Mar", content: "Hermoso apartamento de 2 habitaciones, 2 baños y balcón con vista al océano.", price: 250000.00, category: "PHYSICAL", tenant_id: "demo_tenant" },

    // Restaurante
    { title: "Menú Ejecutivo del Día", content: "Plato fuerte, sopa, bebida y postre. Opción de carne, pollo o vegetariano.", price: 15.50, category: "PHYSICAL", tenant_id: "demo_tenant" },
    { title: "Pizza Artesanal Familiar", content: "Masa madurada 48h, ingredientes frescos y queso mozzarella de calidad.", price: 22.00, category: "PHYSICAL", tenant_id: "demo_tenant" },

    // Infoproductos
    { title: "Curso de Marketing Digital", content: "Aprenda a vender en redes sociales desde cero. Acceso ilimitado y certificación.", price: 197.00, category: "DIGITAL", tenant_id: "demo_tenant" },
    { title: "Masterclass de Finanzas Personales", content: "Aprenda a gestionar sus ahorros e inversiones de manera profesional.", price: 49.00, category: "DIGITAL", tenant_id: "demo_tenant" },

    // Spa
    { title: "Masaje Relajante (1 Hora)", content: "Terapia manual con aceites esenciales para liberar estrés y tensión muscular.", price: 45.00, category: "SERVICES", tenant_id: "demo_tenant" }
];

async function seedArticles() {
    try {
        logger.info('Sembrando artículos/productos especializados...');

        await supabase.from('articles').delete().eq('tenant_id', 'demo_tenant');

        const { error } = await supabase.from('articles').insert(articles);
        if (error) throw error;

        logger.info('¡Artículos sembrados con éxito!');
        console.log('Artículos creados:', articles.length);

        process.exit(0);
    } catch (err) {
        logger.error({ err }, 'Error sembrando artículos');
        process.exit(1);
    }
}

seedArticles();
