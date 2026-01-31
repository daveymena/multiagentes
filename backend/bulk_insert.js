import supabase from './src/db/supabase.client.js';
import logger from './src/utils/logger.js';

// ID de usuario real extraído de los datos proporcionados
const REAL_TENANT_ID = "cmjg5dann0000km6ommqqk7x5";

const realData = [
    {
        "name": "MegaPack Golden",
        "description": "💥Ha llegado el Ultra MegaPack Golden de Cursos…\n\n💥 ¡Una colección ÉPICA con más de 1000 cursos de alto valor!\n\n🎓 Aprende lo que siempre quisiste:\n📊 Marketing\n💻 Programación\n🎨 Diseño gráfico\n📈 Finanzas\n🧠 Desarrollo personal\n🌎 Idiomas y MUCHO más...\n\n🎯 TODO en un solo pack…\n✔️ Sin mensualidades\n✔️ Sin complicaciones\n✔️ Acceso inmediato y de por vida\n\n💰 Y lo mejor…\nPor solo 15 dólares o 65 mil pesos en Colombia.\nSí, leíste bien… ¡TODOS los cursos por menos de lo que vale una salida a comer!\n\n📥 Recíbelos directo en tu correo o WhatsApp\n🎁 BONUS: Incluye material descargable, certificados y asesoría.\n\n⏳ Las oportunidades no esperan.\nToma la decisión hoy y empieza a cambiar tu vida.\n\n👇 Haz clic ahora y consigue tu acceso al Ultra MegaPack Golden de Cursos.",
        "price": 60000,
        "category": "DIGITAL",
        "images": ["https://megapack-nu.vercel.app/supermegapack.jpg"]
    },
    {
        "name": "MEGA PACK COMPLETO - 81 Cursos Profesionales",
        "description": "🎓 MEGA PACK COMPLETO - 81 Cursos Profesionales\n\n✅ Acceso de por vida\n✅ Actualizaciones incluidas\n✅ Entrega inmediata por Google Drive\n\nIncluye: Diseño Gráfico, Marketing Digital, Programación, Excel, Inglés, Hacking Ético, Fotografía, y 74 cursos más!",
        "price": 60000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 02: Cursos Microsoft Office",
        "description": "Cursos completos de Word, Excel, PowerPoint y Access desde básico hasta avanzado",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1493612276216-9c590746f412?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Impresora Brother Multifuncional MFC-T4500DW",
        "description": "Impresora Brother Multifuncional MFC-T4500DW. Producto original con garantía. Envío a toda Colombia.",
        "price": 3049900,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2024/06/MFC-T4500DW.webp"]
    },
    {
        "name": "Portátil Asus Vivobook Go E1504fa-L1745 Amd Ryzen 5-7520u Ram 16gb Ddr5 512 Ssd Pantalla 15.6 Oled Fhd",
        "description": "Portátil Asus Vivobook Go E1504fa-L1745 Amd Ryzen 5-7520u Ram 16gb Ddr5 512 Ssd Pantalla 15.6 Oled Fhd. Producto original con garantía. Envío a toda Colombia.",
        "price": 1899900,
        "category": "PHYSICAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/02/Diseno-sin-titulo-36.webp"]
    },
    {
        "name": "Escáner Epson DS-C490 Automático a Color Dúplex",
        "description": "Escáner Epson DS-C490 Automático a Color Dúplex. Producto original con garantía. Envío a toda Colombia.",
        "price": 2139900,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2024/06/DS-C490-1.webp"]
    },
    {
        "name": "Portatil Asus Vivobook 15 X1502za-Ej2443 Intel core I5-12500h Ram 8gb Ddr4 512gb Ssd Pantalla 15.6",
        "description": "Portatil Asus Vivobook 15 X1502za-Ej2443 Intel core I5-12500h Ram 8gb Ddr4 512gb Ssd Pantalla 15.6. Producto original con garantía. Envío a toda Colombia.",
        "price": 1749900,
        "category": "PHYSICAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/04/1-2025-04-15T112035.293.webp"]
    },
    {
        "name": "Mega Pack 28: PreUniversitario-Psicología",
        "description": "Preparación universitaria especializada en psicología",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1493612276216-9c590746f412?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 29: Curso Resina",
        "description": "Trabajo con resinas y manualidades profesionales",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1481487484168-9b930d5b7d9f?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Portatil Acer Al15-41p-R8f7 Amd Ryzen 7 7500u Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd Ips",
        "description": "Portatil Acer Al15-41p-R8f7 Amd Ryzen 7 7500u Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd Ips. Producto original con garantía. Envío a toda Colombia.",
        "price": 2179900,
        "category": "PHYSICAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/06/1-2025-06-11T095950.195.webp"]
    }
];

const insertData = async () => {
    try {
        logger.info(`Iniciando carga de base de conocimiento para el usuario: ${REAL_TENANT_ID}...`);

        const articles = realData.map(item => ({
            title: item.name,
            content: item.description,
            price: item.price,
            category: item.category,
            image_url: item.images && item.images.length > 0 ? item.images[0] : null,
            tenant_id: REAL_TENANT_ID
        }));

        const { data, error } = await supabase
            .from('articles')
            .upsert(articles, { onConflict: 'tenant_id,title' });

        if (error) {
            console.error('Error de Supabase:', JSON.stringify(error, null, 2));
            logger.error({ error }, 'Error al insertar datos del usuario');
            process.exit(1);
        }

        logger.info(`¡Éxito! Se insertaron/actualizaron ${articles.length} artículos para tu usuario.`);
        process.exit(0);
    } catch (err) {
        logger.error({ err }, 'Fallo crítico en el script de carga personalizada');
        process.exit(1);
    }
};

insertData();
