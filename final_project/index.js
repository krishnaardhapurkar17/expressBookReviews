const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Set up session middleware
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the user is logged in and has an access token in the session
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Retrieve the token

        // Verify the token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // If token is valid, save user details to request
                next(); // Proceed to the next middleware or route handler
            } else {
                // If token is invalid, deny access
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        // If no token is found in the session, deny access
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));