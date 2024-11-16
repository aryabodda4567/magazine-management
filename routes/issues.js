const express = require('express');
const router = express.Router();
const pool = require("../connection/connection");

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Create a new issue
router.post('/', async (req, res) => {
    const { magazine_id, issue_number, publication_date, cover_image_url, status } = req.body;

    try {
        // Validate magazine_id exists
        const [magazineCheck] = await pool.query('SELECT * FROM magazines WHERE magazine_id = ?', [magazine_id]);
        if (magazineCheck.length === 0) {
            return res.status(400).send('Magazine not found');
        }

        const [result] = await pool.query(
            'INSERT INTO issues (magazine_id, issue_number, publication_date, cover_image_url, status) VALUES (?, ?, ?, ?, ?)', 
            [magazine_id, issue_number, publication_date, cover_image_url, status]
        );
        res.status(201).json({ message: 'Issue created successfully', issue_id: result.insertId });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Get all issues (max 40)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT issue_id, magazine_id, issue_number, publication_date, cover_image_url, status, created_at FROM issues LIMIT 40'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get an issue by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT issue_id, magazine_id, issue_number, publication_date, cover_image_url, status, created_at FROM issues WHERE issue_id = ?',
            [id]
        );
        if (rows.length === 0) {
            res.status(404).send('Issue not found');
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update an issue by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { magazine_id, issue_number, publication_date, cover_image_url, status } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE issues SET magazine_id = ?, issue_number = ?, publication_date = ?, cover_image_url = ?, status = ? WHERE issue_id = ?',
            [magazine_id, issue_number, publication_date, cover_image_url, status, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).send('Issue not found');
        } else {
            res.json({ message: 'Issue updated successfully' });
        }
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete an issue by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM issues WHERE issue_id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Issue not found');
        } else {
            res.json({ message: 'Issue deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
