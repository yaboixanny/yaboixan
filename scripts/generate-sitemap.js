import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const BASE_URL = 'https://yaboixan.com'; // Change this to your actual domain
const POSTS_FILE = path.join(__dirname, '..', 'public', 'posts.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

const formatDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
        return c;
    });
};

const generateSitemap = () => {
    console.log('Generating sitemap...');

    let posts = [];
    try {
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        posts = JSON.parse(data);
    } catch (err) {
        console.error('Error reading posts.json:', err);
    }

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Home Page -->
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
`;

    // Add Blog Posts
    posts.forEach(post => {
        if (post.slug) {
            const url = `${BASE_URL}/${escapeXml(post.slug)}/`;
            const date = formatDate(post.date);
            xml += `    <url>
        <loc>${url}</loc>
        <lastmod>${date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>\n`;
        }
    });

    xml += `</urlset>`;

    try {
        fs.writeFileSync(OUTPUT_FILE, xml);
        console.log(`Sitemap successfully generated at ${OUTPUT_FILE}`);
    } catch (err) {
        console.error('Error writing sitemap.xml:', err);
    }
};

generateSitemap();
