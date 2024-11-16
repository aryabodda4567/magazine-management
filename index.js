const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session') 


const magazinesRouter = require("./routes/magazines"); // Import the magazine module
const articleRouter = require("./routes/articles"); // Import the articles module
const userRouter = require("./routes/users"); // Import the users module
const issueRouter = require("./routes/issues"); // Import the issues module
const subscriptionRouter = require("./routes/subscriptions"); // Import the issues module
const loginRouter = require("./routes/login");// Import the login module
 










const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(session({ 
    secret: 'This is very secret ', 
    resave: true, 
    saveUninitialized: true
}));


app.use(bodyParser.json());


 
app.use(function (req, res, next) {
    if (!((req.url === "/login") || (req.url === "/users" && req.method === "POST"))) {
        if (!req.session || !req.session.email) {
            return res.status(403).send("Unauthorized");  
        }
    }
    next();
});


  
// Use the magazine router
app.use('/magazines', magazinesRouter);
app.use('/articles',articleRouter);
app.use('/users',userRouter)
app.use("/issues", issueRouter)
app.use("/subscriptions",subscriptionRouter)
app.use("/login",loginRouter)


app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Failed to log out");
        }
        res.send("Session Destroyed");
    });
});



// Start the server
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});