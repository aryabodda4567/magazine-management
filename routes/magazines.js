const express = require('express');
const router = express.Router();
const pool = require("../connection/connection")


 

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Create a new magazine
router.post('/', async (req, res) => {
    const { title, description, price, publication_frequency } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO magazines (title, description, price, publication_frequency) VALUES (?, ?, ?, ?)', 
            [title, description, price, publication_frequency]
        );
        res.status(201).json({ message: 'Magazine created successfully', magazine_id: result.insertId });
    } catch (error) {
        console.error('Error creating magazine:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Get all magazines (max 40)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM magazines LIMIT 40');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching magazines:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get a magazine by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM magazines WHERE magazine_id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).send('Magazine not found');
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching magazine:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update a magazine by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, price, publication_frequency } = req.body;

    try {
        const [result] = await pool.query('UPDATE magazines SET title = ?, description = ?, price = ?, publication_frequency = ? WHERE magazine_id = ?', [title, description, price, publication_frequency, id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Magazine not found');
        } else {
            res.json({ message: 'Magazine updated successfully' });
        }
    } catch (error) {
        console.error('Error updating magazine:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a magazine by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM magazines WHERE magazine_id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Magazine not found');
        } else {
            res.json({ message: 'Magazine deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting magazine:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;