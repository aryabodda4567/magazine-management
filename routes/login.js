const express = require('express');
const router = express.Router();
const pool = require("../connection/connection");

// Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

router.post("/", async (req, res)=>{
const {email , password_hash} = req.body;


try {
    const [rows] = await pool.query(
        'SELECT email , password_hash FROM users WHERE email = ? and password_hash = ?',
        [email , password_hash]
    );
    if (rows.length === 0) {
        res.status(403).send('Wrong credentials');
    } else {
        req.session.email = email;
        res.status(200).send("Login success");
    }
} catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).send('Internal Server Error');
}


})


module.exports = router;