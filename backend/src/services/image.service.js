import axios from 'axios';
import logger from '../utils/logger.js';

// Mapeo de logos de alta calidad para software común (Megapacks)
const LOGO_MAP = {
    'excel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/1200px-Microsoft_Excel_2013-2019_logo.svg.png',
    'word': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png',
    'powerpoint': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png',
    'office': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg/1200px-Microsoft_Office_logo_%282019%E2%80%93present%29.svg.png',
    'photoshop': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1200px-Adobe_Photoshop_CC_icon.svg.png',
    'illustrator': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Adobe_Illustrator_CC_icon.svg/1200px-Adobe_Illustrator_CC_icon.svg.png',
    'premiere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg/1200px-Adobe_Premiere_Pro_CC_icon.svg.png',
    'after effects': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Adobe_After_Effects_CC_icon.svg/1200px-Adobe_After_Effects_CC_icon.svg.png',
    'canva': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
    'netflix': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
    'spotify': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png',
    'disney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png',
    'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png',
    'facebook': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/1200px-2021_Facebook_icon.svg.png',
    'instagram': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1200px-Instagram_logo_2016.svg.png',
    'tiktok': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Icon_tiktok.svg/1200px-Icon_tiktok.svg.png',
    'golden': 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop', // Gold texture
    'academy': 'https://images.unsplash.com/photo-1523050335392-9beffa71386d?q=80&w=800&auto=format&fit=crop', // University/Academy
    'megapack': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop', // Gift boxes
    'windows': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Windows_logo_-_2021.svg/1200px-Windows_logo_-_2021.svg.png',
    'adobe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Adobe_Corporate_logo.svg/1200px-Adobe_Corporate_logo.svg.png'
};

class ImageService {
    /**
     * Busca la mejor imagen para un título de producto
     * @param {string} title - Título del producto
     * @param {string} content - Contenido o descripción para contexto
     * @param {string} category - Categoría (opcional)
     */
    async findImage(title, content = '', category = '') {
        try {
            const query = (title + ' ' + content).toLowerCase();
            const titleOnly = title.toLowerCase();

            // 1. Detección de Logos Específicos (Prioridad Alta)
            // Primero buscamos software específico (Excel, Word, etc)
            const softwareKeywords = ['excel', 'word', 'powerpoint', 'photoshop', 'illustrator', 'premiere', 'after effects', 'canva', 'windows', 'adobe', 'netflix', 'spotify'];

            for (const key of softwareKeywords) {
                if (query.includes(key)) {
                    logger.info({ title, found: key }, 'Software específico detectado por contexto');
                    return LOGO_MAP[key];
                }
            }

            // Caso especial para Macros
            if (titleOnly.includes('macros') && query.includes('excel')) {
                logger.info({ title }, 'Macro de Excel detectado por contexto');
                return LOGO_MAP['excel'];
            }

            // Luego buscamos otros logos generales
            for (const [key, url] of Object.entries(LOGO_MAP)) {
                if (titleOnly.includes(key)) {
                    logger.info({ title, found: key }, 'Logo general detectado');
                    return url;
                }
            }

            // Limpieza profunda del título para evitar confusión con números de catálogo (ej: "Mega Pack 30")
            const cleanTitle = titleOnly
                .replace(/megapack/g, '')
                .replace(/mega pack/g, '')
                .replace(/pack/g, '')
                .replace(/\d+/g, '') // Quita números (evita que el pack 30 busque el número 30)
                .replace(/[:\-]/g, ' ') // Quita dos puntos y guiones
                .replace(/\s+/g, ' ')
                .trim();

            // 2. Si no es un software conocido, intentamos buscar una imagen real en internet
            try {
                // Usamos el título limpio o partes significativas del contenido
                let searchTerms = cleanTitle;

                // Si el título quedó muy vacío después de limpiar, usamos el contenido
                if (cleanTitle.length < 3 && content) {
                    searchTerms = content.split(/[.\n,]/)[0].substring(0, 50);
                }

                if (titleOnly.includes('macros')) searchTerms += ' excel vba';

                searchTerms += ' product box logo high resolution';

                const searchUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(searchTerms)}&w=800&h=600&c=7&rs=1&p=0&dpr=1&pid=1.7`;

                logger.info({ title, cleanTitle, searchTerms }, 'Buscando imagen en internet con términos limpios');
                return searchUrl;
            } catch (searchError) {
                logger.warn({ searchError }, 'Error in web search fallback');
            }

            // 3. Fallback final: Pollinations AI (Generación)
            const aiPrompt = cleanTitle || 'digital product';
            const seed = Math.floor(Math.random() * 1000);
            const aiImageUrl = `https://image.pollinations.ai/prompt/professional product cover for ${encodeURIComponent(aiPrompt)}, 3d render, high quality, digital marketing style?width=800&height=600&seed=${seed}`;

            return aiImageUrl;

        } catch (error) {
            logger.error({ error, title }, 'Error finding image');
            // Imagen fallback elegante
            return 'https://placehold.co/800x600/e2e8f0/1e293b?text=' + encodeURIComponent(title.substring(0, 20));
        }
    }
}

export const imageService = new ImageService();
export default imageService;
