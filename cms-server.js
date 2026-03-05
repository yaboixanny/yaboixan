import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const POSTS_FILE = path.join(__dirname, 'posts.json');
const UPLOADS_DIR = path.join(__dirname, 'public/images');
const ADMIN_PASSWORD = 'road-to-kyiv'; // You can change this
const AUTH_TOKEN = 'secret-explorer-token';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === AUTH_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// API: Login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ token: AUTH_TOKEN });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

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
app.post('/api/posts', authenticate, upload.single('image'), (req, res) => {
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        category: req.body.category,
        excerpt: req.body.excerpt,
        content: req.body.content,
        image: req.file ? `/images/${req.file.filename}` : '/images/hero.png',
        date: new Date().toISOString().split('T')[0]
    };

    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read posts' });
        const posts = JSON.parse(data);
        posts.unshift(newPost); // Add to beginning

        fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 4), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save post' });
            res.json(newPost);
        });
    });
});

app.listen(PORT, () => {
    console.log(`CMS Backend running at http://localhost:${PORT}`);
});
