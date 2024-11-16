const express = require('express');
const router = express.Router();
const pool = require("../connection/connection");

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Create a new subscription
router.post('/', async (req, res) => {
    const { magazine_id, user_id, start_date, end_date, status } = req.body;

    try {
        // Validate magazine_id exists
        const [magazineCheck] = await pool.query('SELECT * FROM magazines WHERE magazine_id = ?', [magazine_id]);
        if (magazineCheck.length === 0) {
            return res.status(400).send('Magazine not found');
        }

        // Validate user_id exists
        const [userCheck] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
        if (userCheck.length === 0) {
            return res.status(400).send('User not found');
        }

        // Ensure unique subscription (magazine_id + user_id)
        const [subscriptionCheck] = await pool.query(
            'SELECT * FROM subscriptions WHERE magazine_id = ? AND user_id = ?', 
            [magazine_id, user_id]
        );
        if (subscriptionCheck.length > 0) {
            return res.status(400).send('User already subscribed to this magazine');
        }

        const [result] = await pool.query(
            'INSERT INTO subscriptions (magazine_id, user_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)', 
            [magazine_id, user_id, start_date, end_date, status]
        );
        res.status(201).json({ message: 'Subscription created successfully', subscription_id: result.insertId });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all subscriptions (max 40)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT subscription_id, magazine_id, user_id, start_date, end_date, status, created_at FROM subscriptions LIMIT 40'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get a subscription by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT subscription_id, magazine_id, user_id, start_date, end_date, status, created_at FROM subscriptions WHERE subscription_id = ?',
            [id]
        );
        if (rows.length === 0) {
            res.status(404).send('Subscription not found');
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update a subscription by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { magazine_id, user_id, start_date, end_date, status } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE subscriptions SET magazine_id = ?, user_id = ?, start_date = ?, end_date = ?, status = ? WHERE subscription_id = ?',
            [magazine_id, user_id, start_date, end_date, status, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).send('Subscription not found');
        } else {
            res.json({ message: 'Subscription updated successfully' });
        }
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a subscription by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM subscriptions WHERE subscription_id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).send('Subscription not found');
        } else {
            res.json({ message: 'Subscription deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting subscription:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
