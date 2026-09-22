const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory data store for simple Vercel deployment without DB
let tokens = [];
let posts = [];

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Generate token
app.get('/api/generate-token', (req, res) => {
    const token = uuidv4();
    tokens.push({ token, used: false });
    res.json({ token, message: "Save this token to post!" });
});

// Get posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

// Add post
app.post('/api/add', upload.single('file'), (req, res) => {
    const { token, text_content } = req.body;
    const tokenObj = tokens.find(t => t.token === token && !t.used);

    if (!tokenObj) {
        return res.status(400).send('Invalid or already used token. <a href="/">Go back</a>');
    }

    let mediaData = null;
    let mediaType = null;

    if (req.file) {
        const base64 = req.file.buffer.toString('base64');
        const mime = req.file.mimetype;
        mediaData = `data:${mime};base64,${base64}`;
        if (mime.startsWith('image/')) mediaType = 'photo';
        else if (mime.startsWith('video/')) mediaType = 'video';
    }

    const newPost = {
        id: Date.now(),
        text_content: text_content || '',
        media_data: mediaData,
        media_type: mediaType,
        timestamp: new Date().toISOString()
    };

    posts.unshift(newPost);
    tokenObj.used = true; // mark token as used

    // Optional: Outgoing webhook to notify Discord/Slack when a new post is created
    if (process.env.WEBHOOK_URL) {
        fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `New post added: ${text_content}` })
        }).catch(err => console.error("Failed to trigger webhook:", err));
    }

    res.redirect('/');
});

// Incoming Webhook to programmatically add posts
app.post('/api/webhook', (req, res) => {
    const { token, text_content, media_url } = req.body;
    const tokenObj = tokens.find(t => t.token === token && !t.used);

    if (!tokenObj) {
        return res.status(401).json({ error: 'Invalid or already used token.' });
    }

    const newPost = {
        id: Date.now(),
        text_content: text_content || '',
        media_data: media_url || null, // accept a URL for media instead of file upload
        media_type: media_url ? (media_url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'photo') : null,
        timestamp: new Date().toISOString()
    };

    posts.unshift(newPost);
    tokenObj.used = true;

    // Trigger outgoing webhook if set
    if (process.env.WEBHOOK_URL) {
        fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `New post added via webhook: ${text_content}` })
        }).catch(err => console.error("Failed to trigger webhook:", err));
    }

    res.status(200).json({ success: true, post: newPost });
});

if (require.main === module) {
    app.listen(3000, () => console.log('Listening on 3000'));
}

module.exports = app;
