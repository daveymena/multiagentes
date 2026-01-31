import supabase from './src/db/supabase.client.js';
import logger from './src/utils/logger.js';

const REAL_TENANT_ID = "cmjg5dann0000km6ommqqk7x5";

const realData = [
    {
        "name": "MegaPack Golden",
        "description": "💥Ha llegado el Ultra MegaPack Golden de Cursos…\n\n💥 ¡Una colección ÉPICA con más de 1000 cursos de alto valor!\n\n🎓 Aprende lo que siempre quisiste:\n📊 Marketing\n💻 Programación\n🎨 Diseño gráfico\n📈 Finanzas\n🧠 Desarrollo personal\n🌎 Idiomas y MUCHO más...\n\n🎯 TODO en un solo pack…\n✔️ Sin mensualidades\n✔️ Sin complicaciones\n✔️ Acceso inmediato y de por vida\n\n💰 Y lo mejor…\nPor solo 15 dólares o 65 mil pesos en Colombia.\nSí, leíste bien… ¡TODOS los cursos por menos de lo que vale una salida a comer!\n\n📥 Recíbelos directo en tu correo o WhatsApp\n🎁 BONUS: Incluye material descargable, certificados y asesoría.\n\n⏳ Las oportunidades no esperan.\nToma la decisión hoy y empieza a cambiar tu vida.\n\n👇 Haz clic ahora y consigue tu acceso al Ultra MegaPack Golden de Cursos.",
        "price": 60000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1589412151025-06a978f67e0e?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "MEGA PACK COMPLETO - 81 Cursos Profesionales",
        "description": "🎓 MEGA PACK COMPLETO - 81 Cursos Profesionales\n\n✅ Acceso de por vida\n✅ Actualizaciones incluidas\n✅ Entrega inmediata por Google Drive\n\nIncluye: Diseño Gráfico, Marketing Digital, Programación, Excel, Inglés, Hacking Ético, Fotografía, y 74 cursos más!",
        "price": 60000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 02: Cursos Microsoft Office",
        "description": "Cursos completos de Word, Excel, PowerPoint y Access desde básico hasta avanzado",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"]
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
        "images": ["https://images.unsplash.com/photo-1521791136064-7986c2959213?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 29: Curso Resina",
        "description": "Trabajo con resinas y manualidades profesionales",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1596461404969-9fc7c19906d3?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Portatil Acer Al15-41p-R8f7 Amd Ryzen 7 7500u Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd Ips",
        "description": "Portatil Acer Al15-41p-R8f7 Amd Ryzen 7 7500u Ram 16gb Ddr4 1tb Ssd Pantalla 15.6 Fhd Ips. Producto original con garantía. Envío a toda Colombia.",
        "price": 2179900,
        "category": "PHYSICAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/06/1-2025-06-07T122441.705.webp"]
    },
    {
        "name": "Impresora Multifuncional Epson L5590 Wifi Ecotank",
        "description": "Impresora Multifuncional Epson L5590 Wifi Ecotank. Producto original con garantía. Envío a toda Colombia.",
        "price": 1329900,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2023/03/IMPRESORA-Ecotank-L5590-1.jpg.webp"]
    },
    {
        "name": "Impresora Epson Multifuncional Wifi Ecotank L3251",
        "description": "Impresora Epson Multifuncional Wifi Ecotank L3251. Producto original con garantía. Envío a toda Colombia.",
        "price": 990000,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2024/03/L3251-1.webp"]
    },
    {
        "name": "Impresora Canon Multifuncional G3170 Tinta Continua Wifi",
        "description": "Impresora Canon Multifuncional G3170 Tinta Continua Wifi. Producto original con garantía. Envío a toda Colombia.",
        "price": 789900,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2024/03/1-15.png"]
    },
    {
        "name": "Impresora Epson Multifuncional EcoTank L6270",
        "description": "Impresora Epson Multifuncional EcoTank L6270. Producto original con garantía. Envío a toda Colombia.",
        "price": 2189900,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2024/02/1-22.png"]
    },
    {
        "name": "Moto Bajaj Pulsar NS 160 FI1 (2020)",
        "description": "🏍️ BAJAJ PULSAR NS 160 FI1 - MODELO 2020\n\n¡Moto en excelentes condiciones, lista para rodar! 🔥\n\n📋 ESPECIFICACIONES:\n🚦 Modelo: 2020\n⚙️ Motor: 160cc Inyección Electrónica (FI1)\n🧾 Papeles: Al día + Traspaso disponible\n🛠️ Mantenimiento: Reciente, todo al día\n💥 Estado: Impecable y muy cuidada\n✅ SOAT y Tecnomecánica vigentes\n\n💰 PRECIOS:\n💵 Precio inicial: $6.500.000 COP\n🎯 Con rebaja: $6.300.000 COP\n🔥 Precio final negociable: $6.000.000 COP",
        "price": 6500000,
        "category": "DIGITAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/09/pulsar.jpg"]
    },
    {
        "name": "Mega Pack 35: Álbumes digitales de colección",
        "description": "Álbumes digitales especializados y de colección",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1544391496-1ca7c97457cd?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 31: 550 Planos de Muebles de Melamina",
        "description": "Planos detallados para fabricación de muebles",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Mega Pack 27: Cursos MultiProfesiones",
        "description": "Diversos oficios y profesiones en un solo pack",
        "price": 20000,
        "category": "DIGITAL",
        "images": ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"]
    },
    {
        "name": "Portatil Asus Vivobook 16 X1605va-Mb1235 Intel Ci7-13620h Ram 16gb Ddr5 512gb Ssd Pantalla 16.0",
        "description": "Portatil Asus Vivobook 16 X1605va-Mb1235 Intel Ci7-13620h Ram 16gb Ddr5 512gb Ssd Pantalla 16.0. Producto original con garantía. Envío a toda Colombia.",
        "price": 2449900,
        "category": "PHYSICAL",
        "images": ["https://megacomputer.com.co/wp-content/uploads/2025/04/1-2025-04-15T143703.707.webp"]
    },
    {
        "name": "Tablet Acer Iconia M10 Wifi 10.1 Wxga Ips 4gb-64gb Champagne",
        "description": "La Tablet Acer Iconia M10 es una tablet Android de 10.1 pulgadas, diseñada para ofrecer un equilibrio perfecto entre rendimiento, portabilidad y entretenimiento multimedia.",
        "price": 498900,
        "category": "PHYSICAL",
        "images": ["https://thumb.pccomponentes.com/w-530-530/articles/1086/10861246/1354-acer-iconia-tab-m10-wifi-101-4-64gb-dorada.jpg"]
    }
];

const insertData = async () => {
    try {
        logger.info(`Actualizando catálogo con ENLACES EXTERNOS de alta calidad para el usuario: ${REAL_TENANT_ID}...`);

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
            logger.error({ error }, 'Error al insertar datos visuales');
            process.exit(1);
        }

        logger.info(`¡Éxito TOTAL! Se han actualizado las imágenes de los 20 artículos usando CDN.`);
        process.exit(0);
    } catch (err) {
        logger.error({ err }, 'Fallo crítico en el script CDN');
        process.exit(1);
    }
};

insertData();
