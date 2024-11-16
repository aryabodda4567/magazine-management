const express = require('express');
const router = express.Router();
const pool = require("../connection/connection");

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Create a new user
router.post('/', async (req, res) => {
    const { full_name, email, role, password_hash } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, role, password_hash) VALUES (?, ?, ?, ?)', 
            [full_name, email, role, password_hash]
        );
        res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Get all users (max 40)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, full_name, email, role, created_at FROM users LIMIT 40');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, email, role, password_hash } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE users SET full_name = ?, email = ?, role = ?, password_hash = ? WHERE user_id = ?',
            [full_name, email, role, password_hash, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).send('User not found');
        } else {
            res.json({ message: 'User updated successfully' });
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Email already exists');
        } else {
            console.error('Error updating user:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('User not found');
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
