import supabase from './src/db/supabase.client.js';

async function checkArticles() {
    const { data, error } = await supabase.from('articles').select('title, image_url');
    if (error) {
        console.error(error);
        return;
    }
    console.log('ARTICLES_LIST:');
    data.forEach(a => {
        console.log(`- ${a.title} | Image: ${a.image_url ? 'YES' : 'NO'} | URL: ${a.image_url?.substring(0, 30)}...`);
    });
    process.exit(0);
}

checkArticles();
