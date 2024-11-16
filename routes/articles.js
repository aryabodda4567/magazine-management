const express = require('express');
const router = express.Router();
const pool = require("../connection/connection");

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Create a new article
router.post('/', async (req, res) => {
    const { issue_id, title, content, author_id, status } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO articles (issue_id, title, content, author_id, status) VALUES (?, ?, ?, ?, ?)',
            [issue_id, title, content, author_id, status || 'draft']
        );
        res.status(201).json({ message: 'Article created successfully', article_id: result.insertId });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all articles (max 40)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM articles LIMIT 40');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get an article by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM articles WHERE article_id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update an article by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { issue_id, title, content, author_id, status } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE articles SET issue_id = ?, title = ?, content = ?, author_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE article_id = ?',
            [issue_id, title, content, author_id, status, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).send('Article not found');
        } else {
            res.json({ message: 'Article updated successfully' });
        }
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete an article by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM articles WHERE article_id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Article not found');
        } else {
            res.json({ message: 'Article deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
