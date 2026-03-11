import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const POSTS_FILE = path.join(__dirname, 'public', 'posts.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'images');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API: Get all posts
app.get('/api/posts', (req, res) => {
    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read posts' });
        res.json(JSON.parse(data));
    });
});

// API: Add new post
app.post('/api/posts', upload.single('image'), (req, res) => {
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        category: req.body.category,
        excerpt: req.body.excerpt,
        content: req.body.content,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        image: req.file ? `/images/${req.file.filename}` : '/images/hero.png',
        date: new Date().toISOString().split('T')[0]
    };

    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read posts' });
        const posts = JSON.parse(data);
        posts.unshift(newPost); // Add to beginning

        fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 4), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save post' });

            // Re-generate sitemap
            exec('node scripts/generate-sitemap.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Sitemap generation error: ${error}`);
                }
                console.log(`Sitemap generated: ${stdout}`);
            });

            res.json(newPost);
        });
    });
});

app.listen(PORT, () => {
    console.log(`CMS Backend running at http://localhost:${PORT}`);
});
