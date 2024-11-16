const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const magazinesRouter = require("./routes/magazines"); // Import the magazine module
const articleRouter = require("./routes/articles"); // Import the articles module
const userRouter = require("./routes/users"); // Import the users module
const issueRouter = require("./routes/issues"); // Import the issues module
const subscriptionRouter = require("./routes/subscriptions"); // Import the issues module










const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());




// Use the magazine router
app.use('/magazines', magazinesRouter);
app.use('/articles',articleRouter);
app.use('/users',userRouter)
app.use("/issues", issueRouter)
app.use("/subscriptions",subscriptionRouter)




// Start the server
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});